module.exports = (sequelize, DataTypes) => {
  const Invite = sequelize.define("Invite", {
    datasetId: DataTypes.INTEGER,
    receiver: DataTypes.STRING,
    reward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {min: 0}
    },
    penalty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {min: 0}
    },
    deadline: {
      type: DataTypes.DATE,
      defaultValue: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    },
    status: {
      type: DataTypes.ENUM("等待回复", "已接受", "已拒绝"),
      defaultValue: "等待回复"
    }
  }, {
    uniqueKeys: {
      label_unique: {
        fields: ["datasetId", "receiver"]
      }
    }
  });
  Invite.associate = (models) => {
    Invite.belongsTo(models.Dataset, {
      foreignKey: "datasetId",
      as: "dataset",
      onDelete: "CASCADE",
    });
  }
  return Invite;
};