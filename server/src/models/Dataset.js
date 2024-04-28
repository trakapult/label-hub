module.exports = (sequelize, DataTypes) => {
  const Dataset = sequelize.define("Dataset", {
    name: DataTypes.STRING,
    admin: DataTypes.STRING,
    description: DataTypes.STRING,
    dataType: DataTypes.STRING,
    sampleNum: DataTypes.INTEGER,
    labelType: DataTypes.STRING,
    labelInfo: DataTypes.JSON,
    segments: DataTypes.BOOLEAN,
    publicized: DataTypes.BOOLEAN,
    reward: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {min: 0}
    },
  }, {
    uniqueKeys: {
      dataset_unique: {
        fields: ["name", "admin"]
      }
    }
  });
  return Dataset;
};