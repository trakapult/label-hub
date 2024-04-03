const { Dataset } = require("../models");
const { Op }  = require("sequelize");
const fs = require("fs");
const admZip = require("adm-zip");

module.exports = {
  async create (req, res) {
    try {
      console.log(req.file);
      const {name, admin, description, dataType, labelType, segments} = req.body;
      const file = req.file;
      console.log(name, admin, description, dataType, labelType, segments);
      const dataset = await Dataset.create({name, admin, description, dataType, labelType, segments});
      const path = `./data/${dataset.id}.zip`;
      fs.writeFileSync(path, fs.readFileSync(file.path));
      fs.unlinkSync(file.path);
      res.send(dataset);
    } catch(err) {
      console.log(err);
      if (err.name === "SequelizeUniqueConstraintError") {
        res.status(400).send({error: "数据集已存在"});
      } else {
        res.status(400).send({error: "创建数据集时发生错误"});
      }
    }
  },
  async index (req, res) {
    try {
      let datasets = null;
      const search = req.query.search;
      const dataType = req.query.dataType;
      const labelType = req.query.labelType;
      let segments = null;
      if (req.query.segments) {
        segments = req.query.segments === "yes";
      }
      datasets = await Dataset.findAll({
        where: {
          [Op.and]: [
            search && {[Op.or]: [
              {name: {[Op.substring]: search}},
              {admin: {[Op.substring]: search}},
              {description: {[Op.substring]: search}}
            ]},
            dataType && {dataType},
            labelType && {labelType},
            segments !== null && {segments}
          ]
        },
        order: [["createdAt", "DESC"]]
      });
      res.send(datasets);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async show (req, res) {
    try {
      const dataset = await Dataset.findByPk(req.params.datasetId);
      console.log(req.params.datasetId, dataset);
      res.send(dataset);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async sendFile (req, res) {
    try {
      const dataset = await Dataset.findByPk(req.params.datasetId);
      const path = `./data/${dataset.id}`;
      if (!fs.existsSync(path)) {
        const zipFile = new admZip(fs.readFileSync(path + ".zip"));
        const zipEntries = zipFile.getEntries();
        // recursively retrieve files from the zip and rename them to their index
        zipEntries.forEach((zipEntry, index) => {
          zipFile.extractEntryTo(zipEntry.entryName, path, false, true);
          fs.renameSync(`${path}/${zipEntry.entryName}`, `${path}/${index}`);
        });
      }
      // read binary file and send it
      const file = fs.readFileSync(`${path}/${req.params.sampleId}`, "binary");
      console.log(file.length);
      res.send(file);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集文件时发生错误"});
    }
  }
};