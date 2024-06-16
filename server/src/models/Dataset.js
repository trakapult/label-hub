const fs = require("fs");
const config = require("../config");

module.exports = (sequelize, DataTypes) => {
  const Dataset = sequelize.define("Dataset", {
    name: DataTypes.STRING,
    admin: DataTypes.STRING,
    description: DataTypes.STRING,
    sampleNum: {
      type: DataTypes.INTEGER,
      validate: {min: 1}
    },
    type: {
      type: DataTypes.STRING,
      validate: {isIn: [["public", "private", "entertain"]]},
    },
    dataType: {
      type: DataTypes.STRING,
      validate: {isIn: [["text", "image", "audio"]]},
    },
    labelType: {
      type: DataTypes.STRING,
      validate: {isIn: [["categorical", "numerical", "textual"]]},
    },
    labelInfo: DataTypes.JSON,
    segments: DataTypes.BOOLEAN,
    reward: {
      type: DataTypes.INTEGER,
      validate: {min: 0}
    },
    deadline: DataTypes.DATE,
    settled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    uniqueKeys: {
      dataset_unique: {
        fields: ["name", "admin"]
      }
    }
  });
  Dataset.associate = (models) => {
    Dataset.hasMany(models.Label, {
      foreignKey: "datasetId",
      as: "labels",
      onDelete: "CASCADE",
    });
  };
  Dataset.beforeSave((dataset) => {
    if (!dataset.reward) {
      if (dataset.segments) {
        dataset.reward = config.rewardSystem.segmentsPay;
      } else {
        dataset.reward = config.rewardSystem.noSegmentsPay;
      }
    }
    if (!dataset.deadline) {
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      dataset.deadline = new Date(Date.now() + ONE_WEEK).toISOString().split("T")[0];
    }
  });
  Dataset.afterUpdate(async (dataset) => {
    const { Label, Points } = dataset.sequelize.models;
    await Points.destroy({where: {datasetId: dataset.id, receiver: dataset.admin, reason: "upload"}, individualHooks: true});
    const labels = await Label.findAll({where: {datasetId: dataset.id}});
    for (const label of labels) {
      const path = `./data/labels/${label.id}`;
      if (fs.existsSync(path))
        fs.rmSync(path, {recursive: true});
    }
    await Label.destroy({where: {datasetId: dataset.id}, individualHooks: true});
  });
  Dataset.afterDestroy(async (dataset) => {
    const { Points } = dataset.sequelize.models;
    await Points.destroy({where: {datasetId: dataset.id, receiver: dataset.admin, reason: "upload"}, individualHooks: true});
  });
  return Dataset;
};