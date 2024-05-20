const {
  settleUploadReward,
  retrieveUploadReward,
  validate,
  settleLabelPayment,
  retrieveLabelPayment
} = require("./utils");

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
      settleLabelPayment(label, dataset);
    } else {
      retrieveLabelPayment(label, dataset);
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
      retrieveLabelPayment(label, dataset);
    }
  });
  return Label;
};