module.exports = (sequelize, DataTypes) => {
  const Dataset = sequelize.define("Dataset", {
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    dataType: DataTypes.STRING,
    labelType: DataTypes.STRING,
    segment: DataTypes.BOOLEAN
  }, {
    uniqueKeys: {
      dataset_unique: {
        fields: ["userId", "name"]
      }
    }
  });
  return Dataset;
}