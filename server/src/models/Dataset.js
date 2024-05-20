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
    Dataset.hasMany(models.Points, {
      foreignKey: "datasetId",
      as: "points",
      onDelete: "CASCADE",
    });
  };
  Dataset.beforeSave(async (dataset) => {
    if (!dataset.reward) {
      if (dataset.segments) {
        dataset.reward = 2;
      } else {
        dataset.reward = 1;
      }
    }
    if (!dataset.deadline) {
      dataset.deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    }
  });
  Dataset.afterUpdate(async (dataset) => {
    const { Points } = dataset.sequelize.models;
    const points = await Points.findOne({where: {
      receiver: dataset.admin,
      datasetId: dataset.id,
      reason: "upload"
    }});
    if (points) {
      await points.update({amount: dataset.type === "public" ? 20 * dataset.sampleNum : 0});
    }
  });
  Dataset.afterDestroy(async (dataset) => {
    const { Points } = dataset.sequelize.models;
    await Points.destroy({where: {
      receiver: dataset.admin,
      datasetId: dataset.id,
      reason: "upload"
    }});
  });
  return Dataset;
};