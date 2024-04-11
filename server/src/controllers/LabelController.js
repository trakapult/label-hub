const { Label, User, Dataset } = require('../models');
const fs = require("fs");

module.exports = {
  async create (req, res) {
    try {
      const {datasetId, labeler} = req.params;
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权上传此标注"});
        return;
      }
      const path = `./data/labels/${datasetId}/`;
      if (!fs.existsSync(path)) fs.mkdirSync(path);
      const labels = req.body;
      fs.writeFileSync(path + `${labeler}.json`, JSON.stringify(labels));
      let labeledNum = Object.keys(labels).length;
      fs.writeFileSync(path + `${labeler}.labeledNum`, labeledNum.toString());
      let label = await Label.findOne({where: {datasetId, labeler}});
      if (!label) label = await Label.create({datasetId, labeler});
      res.send(label);
    }
    catch(err) {
      console.log(err);
      res.status(400).send({error: "上传标注时发生错误"});
    }
  },
  async show (req, res) {
    try {
      const {datasetId, labeler} = req.params;
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权访问此标注"});
        return;
      }
      const label = await Label.findOne({where: {datasetId, labeler}});
      if (!label) {
        res.send({label: null, labeledNum: 0});
        return;
      }
      const labeledNum = parseInt(fs.readFileSync(`./data/labels/${datasetId}/${labeler}.labeledNum`));
      res.send({label, labeledNum});
    } catch(err) {
      console.log(err);
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
      const labels = await Label.findAll({where: {labeler}, order: [["updatedAt", "DESC"]]});
      const datasets = await Promise.all(labels.map(async label => {
        const dataset = await Dataset.findByPk(label.datasetId);
        const labeledNum = parseInt(fs.readFileSync(`./data/labels/${label.datasetId}/${label.labeler}.labeledNum`));
        return {dataset, labeledNum};
      }));
      res.send(datasets);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async showLabelRecords (req, res) {
    try {
      const {datasetId} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权访问这些标注记录"});
        return;
      }
      const labels = await Label.findAll({where: {datasetId}});
      const records = await Promise.all(labels.map(async label => {
        const labeledNum = parseInt(fs.readFileSync(`./data/labels/${label.datasetId}/${label.labeler}.labeledNum`));
        return {label, labeledNum};
      }));
      res.send(records);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取标注者时发生错误"});
    }
  },
  async sendLabelData(req, res) {
    try {
      const {datasetId, labeler} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (req.user.name !== dataset.admin && req.user.name !== labeler) {
        res.status(403).send({error: "您无权访问此标注记录"});
        return;
      }
      const labelData = fs.readFileSync(`./data/labels/${datasetId}/${labeler}.json`);
      res.send(JSON.parse(labelData));
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取标注记录时发生错误"});
    }
  }
};