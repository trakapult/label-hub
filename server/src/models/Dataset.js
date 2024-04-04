module.exports = (sequelize, DataTypes) => {
  const Dataset = sequelize.define("Dataset", {
    name: DataTypes.STRING,
    admin: DataTypes.STRING,
    description: DataTypes.STRING,
    dataType: DataTypes.STRING,
    labelType: DataTypes.STRING,
    labelInfo: DataTypes.JSON,
    segments: DataTypes.BOOLEAN
  }, {
    uniqueKeys: {
      dataset_unique: {
        fields: ["name", "admin"]
      }
    }
  });
  return Dataset;
}