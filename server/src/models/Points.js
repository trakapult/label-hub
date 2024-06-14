module.exports = (sequelize, DataTypes) => {
  const Points = sequelize.define("Points", {
    receiver: DataTypes.STRING,
    datasetId: DataTypes.INTEGER,
    reason: {
      type: DataTypes.STRING,
      validate: {
        startsWith: (value) => {
          if (value === "upload" || value === "labelGet" || value === "correctGet" || value === "inviteGet") {
            return;
          }
          if (value.startsWith("labelPay ") || value.startsWith("correctPay ") || value.startsWith("invitePay ")) {
            return;
          }
          throw new Error(`Invalid reason: ${value}`);
        }
      }
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
  Points.afterSave(async (points) => {
    const { User } = points.sequelize.models;
    const user = await User.findOne({where: {name: points.receiver}});
    const pointsChange = points.amount - (points._previousDataValues.amount || 0);
    await user.update({points: Math.max(0, user.points + pointsChange)});
  });
  Points.afterDestroy(async (points) => {
    const { User } = points.sequelize.models;
    const user = await User.findOne({where: {name: points.receiver}});
    await user.update({points: Math.max(0, user.points - points.amount)});
  });
  return Points;
};