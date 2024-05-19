const fs = require("fs");
const assert = require("assert");

const savePoints = async (receiver, datasetId, reason, amount, add = false) => {
  const { Points } = require("../models");
  const points = await Points.findOne({where: {receiver, datasetId, reason}});
  if (points) {
    await points.update({amount: add ? points.amount + amount : amount});
    return;
  }
  await Points.create({receiver, datasetId, reason, amount});
}

const destroyPoints = async (receiver, datasetId, reason) => {
  const { Points } = require("../models");
  const points = await Points.findOne({where: {receiver, datasetId, reason}});
  if (points) {
    await points.destroy();
  }
}

const settleUploadReward = async (dataset) => {
  const amount = dataset.type === "public" ? 5 * dataset.sampleNum : 0;
  savePoints(dataset.admin, dataset.id, "upload", amount);
}

const retrieveUploadReward = async (dataset) => {
  destroyPoints(dataset.admin, dataset.id, "upload");
}

const validate = (label, dataset) => {
  if (dataset.type === "entertain")
    return true;
  if (label.labeledNum !== dataset.sampleNum)
    return false;
  const groudTruthPath = `./data/datasets/${dataset.id}/groundTruth.json`;
  if (!fs.existsSync(groudTruthPath))
    return true;
  const groudTruth = JSON.parse(fs.readFileSync(groudTruthPath));
  const labelPath = `./data/labels/${dataset.id}/${label.labeler}.json`;
  assert(fs.existsSync(labelPath), `Label file ${labelPath} does not exist`);
  const labelData = JSON.parse(fs.readFileSync(labelPath));
  return Object.keys(groudTruth).every(key => labelData[key] === groudTruth[key]);
}

const settlePayment = async (label, dataset) => {
  if (dataset.type === "entertain") {
    const amount = -dataset.reward * label.labeledNum;
    savePoints(label.labeler, label.datasetId, "getLabelingReward", amount, true);
    return;
  }
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const amount = Math.min(dataset.reward * label.labeledNum, admin.points);
  savePoints(label.labeler, label.datasetId, "getLabelingReward", amount);
  savePoints(dataset.admin, label.datasetId, "payLabelingReward", -amount);
}

const retrievePayment = async (label, dataset) => {
  destroyPoints(label.labeler, label.datasetId, "getLabelingReward");
  destroyPoints(dataset.admin, label.datasetId, "payLabelingReward");
}

module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define("Label", {
    datasetId: DataTypes.INTEGER,
    labeler: DataTypes.STRING,
    labeledNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    correctNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    validated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    uniqueKeys: {
      label_unique: {
        fields: ["datasetId", "labeler"]
      }
    },
    validate: {
      validateCorrectNum() {
        if (this.correctNum > this.labeledNum) {
          throw new Error("Correct number exceeds labeled number");
        }
      }
    }
  });
  Label.associate = (models) => {
    Label.belongsTo(models.Dataset, {
      foreignKey: "datasetId",
      as: "dataset",
      onDelete: "CASCADE",
    });
  };
  Label.beforeSave(async (label) => {
    const { Dataset } = label.sequelize.models;
    const dataset = await Dataset.findByPk(label.datasetId);
    label.validated = validate(label, dataset);
  });
  Label.afterSave(async (label) => {
    const { Dataset } = label.sequelize.models;
    const dataset = await Dataset.findByPk(label.datasetId);
    const count = await Label.count({where: {
      datasetId: label.datasetId,
      labeledNum: dataset.sampleNum,
      validated: true
    }});
    if (count === 1) {
      settleUploadReward(dataset);
    } else if (count === 0) {
      retrieveUploadReward(dataset);
    }
    if (label.validated) {
      settlePayment(label, dataset);
    } else {
      retrievePayment(label, dataset);
    }
  });
  Label.afterDestroy(async (label) => {
    const { Dataset } = label.sequelize.models;
    const dataset = await Dataset.findByPk(label.datasetId);
    const count = await Label.count({where: {
      datasetId: label.datasetId,
      labeledNum: dataset.sampleNum
    }});
    if (count === 0) {
      retrieveUploadReward(dataset);
    }
    if (dataset.type !== "entertain") {
      retrievePayment(label, dataset);
    }
  });
  return Label;
};