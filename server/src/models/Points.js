module.exports = (sequelize, DataTypes) => {
  const Points = sequelize.define("Points", {
    receiver: DataTypes.STRING,
    datasetId: DataTypes.INTEGER,
    reason: {
      type: DataTypes.STRING,
      validate: {isIn: [[
        "upload",
        "getLabelingReward", "payLabelingReward",
        "getCorrectReward", "payCorrectReward",
        "getInviteReward", "payInviteReward"
      ]]},
    },
    amount: DataTypes.INTEGER
  }, {
    uniqueKeys: {
      points_unique: {
        fields: ["receiver", "datasetId", "reason"]
      }
    }
  });
  Points.associate = (models) => {
    Points.belongsTo(models.User, {
      foreignKey: "receiver",
      targetKey: "name",
      as: "user",
      onDelete: "CASCADE"
    });
    Points.belongsTo(models.Dataset, {
      foreignKey: "datasetId",
      as: "dataset",
      onDelete: "CASCADE"
    });
  };
  Points.afterCreate(async (points) => {
    const { User } = points.sequelize.models;
    const user = await User.findOne({where: {name: points.receiver}});
    console.log("Ceate", user.points, points.amount);
    await user.update({points: Math.max(0, user.points + points.amount)});
  });
  Points.afterUpdate(async (points) => {
    const { User } = points.sequelize.models;
    const user = await User.findOne({where: {name: points.receiver}});
    console.log("Update", user.points, points._previousDataValues.amount, points.amount, Math.max(0, user.points - points._previousDataValues.amount + points.amount));
    await user.update({points: Math.max(0, user.points - points._previousDataValues.amount + points.amount)});
  });
  Points.afterDestroy(async (points) => {
    const { User } = points.sequelize.models;
    const user = await User.findOne({where: {name: points.receiver}});
    await user.update({points: Math.max(0, user.points - points.amount)});
  });
  return Points;
};