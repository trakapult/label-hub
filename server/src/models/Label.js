module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define("Label", {
    datasetId: DataTypes.INTEGER,
    labeler: DataTypes.STRING,
  }, {
    uniqueKeys: {
      label_unique: {
        fields: ["datasetId", "labeler"]
      }
    }
  });
  return Label;
};