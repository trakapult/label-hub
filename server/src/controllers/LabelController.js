const { Label } = require('../models');
const fs = require("fs");

module.exports = {
  async create (req, res) {
    try {
      const {datasetId, labeler} = req.params;
      console.log(req.user.name, labeler);
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权上传此标注"});
        return;
      }
      const path = `./data/labels/${datasetId}/`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      fs.writeFileSync(path + `${labeler}.json`, JSON.stringify(req.body.labels));
      let label = await Label.findOne({where: {datasetId, labeler}});
      if (!label) {
        label = await Label.create({datasetId, labeler});
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
      const label = await Label.findOne({where: {datasetId, labeler}});
      if (!label) {
        res.send({label: null, data: []});
        return;
      }
      const path = `./data/labels/${datasetId}/${labeler}.json`;
      const data = fs.readFileSync(path);
      res.send({label, data: JSON.parse(data)});
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取标注时发生错误"});
    }
  }
};