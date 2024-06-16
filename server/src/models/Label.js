const {
  settleUploadReward,
  retrieveUploadReward,
  validate,
  settleLabelPayment,
  retrieveLabelPayment
} = require("./utils");

module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define("Label", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    datasetId: DataTypes.INTEGER,
    labeler: DataTypes.STRING,
    labeledNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    accSum: {
      type: DataTypes.FLOAT,
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
      validateAccSum() {
        if (this.accSum > this.labeledNum) {
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
      validated: true
    }});
    if (count === 1) {
      await settleUploadReward(dataset);
    } else if (count === 0) {
      await retrieveUploadReward(dataset);
    }
    if (label.validated) {
      await settleLabelPayment(label, dataset);
    } else {
      await retrieveLabelPayment(label, dataset);
    }
  });
  return Label;
};