const { Dataset } = require("./Dataset");

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
  return Label;
};