const { settleInvitePayment } = require("./utils");

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
  };
  Invite.afterDestroy(async (invite) => {
    if (invite.status !== "已接受") return;
    const { Dataset, Label } = invite.sequelize.models;
    const dataset = await Dataset.findByPk(invite.datasetId);
    const label = await Label.findOne({where: {
      datasetId: invite.datasetId,
      labeler: invite.receiver
    }});
    await settleInvitePayment(invite, label, dataset);
  });
  return Invite;
};