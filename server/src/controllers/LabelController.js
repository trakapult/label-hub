const { Label, User, Dataset } = require('../models');
const fs = require("fs");

module.exports = {
  async create (req, res) {
    try {
      const {datasetId, labeler, labels} = req.body;
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权上传此标注"});
        return;
      }
      const path = `./data/labels/${datasetId}/`;
      if (!fs.existsSync(path)) fs.mkdirSync(path);
      fs.writeFileSync(path + `${labeler}.json`, JSON.stringify(labels));
      const labeledNum = Object.keys(labels).length;
      let label = await Label.findOne({where: {datasetId, labeler}});
      const dataset = await Dataset.findByPk(datasetId);
      if (!label) {
        await User.update(
          {points: User.sequelize.literal(`points + ${dataset.reward * labeledNum}`)},
          {where: {name: labeler}}
        );
        label = await Label.create({datasetId, labeler, labeledNum});
      } else {
        await User.update(
          {points: User.sequelize.literal(`points + ${dataset.reward * (labeledNum - label.labeledNum)}`)},
          {where: {name: labeler}}
        );
        label.labeledNum = labeledNum;
        await label.save();
      }
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
      res.send(label);
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
      const labels = await Label.findAll({
        where: {labeler},
        order: [["updatedAt", "DESC"]],
        include: [{model: Dataset, as: "dataset"}]
      });
      res.send(labels);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async showLabelRecords (req, res) {
    try {
      const {datasetId} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (!dataset.publicized && req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权访问这些标注记录"});
        return;
      }
      const labels = await Label.findAll({where: {datasetId}});
      res.send(labels);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取标注者时发生错误"});
    }
  },
  async sendLabelData(req, res) {
    try {
      const {datasetId, labeler} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (!dataset.publicized && req.user.name !== dataset.admin && req.user.name !== labeler) {
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