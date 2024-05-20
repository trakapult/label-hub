const { Label, Dataset } = require('../models');
const fs = require("fs");

module.exports = {
  async create (req, res) {
    try {
      const {datasetId, labeler, labelData} = req.body;
      const dataset = await Dataset.findByPk(datasetId);
      if (new Date(dataset.deadline) < new Date()) {
        res.status(403).send({error: "标注已截止"});
        return;
      }
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权上传此标注"});
        return;
      }
      if (dataset.type !== "entertain") {
        const path = `./data/labels/${datasetId}`;
        if (!fs.existsSync(path)) fs.mkdirSync(path);
        fs.writeFileSync(`${path}/${labeler}.json`, JSON.stringify(labelData));
      }
      const labeledNum = Object.keys(labelData).length;
      let label = await Label.findOne({where: {datasetId, labeler}});
      if (!label) {
        label = await Label.create({datasetId, labeler});
      }
      label.labeledNum = labeledNum;
      if (dataset.type === "entertain") {
        const settingsPath = `./data/datasets/${datasetId}/settings.json`;
        if (fs.existsSync(settingsPath)) {
          const answers = JSON.parse(fs.readFileSync(settingsPath)).answers;
          if (answers) {
            label.correctNum = Object.keys(labelData).filter((key) => answers[key] === labelData[key]).length;
          }
        }
      }
      await label.save();
      res.send(label);
    }
    catch(err) {
      console.error(err);
      res.status(400).send({error: "上传标注时发生错误"});
    }
  },
  async show (req, res) {
    try {
      const {datasetId, labeler} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (dataset.type === "entertain") {
        res.send({});
        return;
      }
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权访问此标注"});
        return;
      }
      const label = await Label.findOne({where: {datasetId, labeler}});
      res.send(label);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取标注时发生错误"});
    }
  },
  async showDatasets (req, res) {
    try {
      const {labeler} = req.params;
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权访问这些数据集"});
        return;
      }
      const labels = await Label.findAll({
        where: {labeler},
        order: [["updatedAt", "DESC"]],
        include: [{model: Dataset, as: "dataset"}]
      });
      res.send(labels);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async showLabelRecords (req, res) {
    try {
      const {datasetId} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (dataset.type !== "public" && req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权访问这些标注记录"});
        return;
      }
      const labels = await Label.findAll({where: {datasetId}});
      res.send(labels);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取标注者时发生错误"});
    }
  },
  async sendLabelData(req, res) {
    try {
      const {datasetId, labeler} = req.params;
      const {nameAsKey} = req.query;
      const dataset = await Dataset.findByPk(datasetId);
      if (dataset.type === "entertain") {
        res.send({});
        return;
      }
      if (dataset.type !== "public" && req.user.name !== dataset.admin && req.user.name !== labeler) {
        res.status(403).send({error: "您无权访问此标注记录"});
        return;
      }
      const labelData = JSON.parse(fs.readFileSync(`./data/labels/${datasetId}/${labeler}.json`));
      const names = JSON.parse(fs.readFileSync(`./data/datasets/${datasetId}_names.json`));
      if (!nameAsKey) {
        res.send(labelData);
        return;
      }
      const labelDataWithNames = {};
      for (const key in labelData) {
        labelDataWithNames[names[key]] = labelData[key];
      }
      res.send(labelDataWithNames);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取标注记录时发生错误"});
    }
  }
};