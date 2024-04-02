const { Dataset } = require('../models');
const fs = require('fs');

module.exports = {
  async create (req, res) {
    try {
      console.log(req.file);
      const {userId, name, description, dataType, labelType, segment} = req.body;
      const file = req.file;
      console.log(userId, name, description, dataType, labelType, segment);
      let dataset = await Dataset.findOne({where: {userId, name}});
      if (dataset) {
        return res.status(400).send({error: "数据集已存在"});
      }
      dataset = await Dataset.create({userId, name, description, dataType, labelType, segment});
      const path = `./data/${dataset.id}.zip`;
      fs.writeFileSync(path, fs.readFileSync(file.path));
      fs.unlinkSync(file.path);
      res.send(dataset.toJSON());
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "创建数据集时发生错误"});
    }
  },
  async index (req, res) {
    try {
      const datasets = await Dataset.findAll();
      res.send(datasets);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async show (req, res) {
    console.log("showing");
    try {
      const dataset = await Dataset.findByPk(req.params.datasetId);
      console.log(req.params.datasetId, dataset);
      res.send(dataset);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  }
};