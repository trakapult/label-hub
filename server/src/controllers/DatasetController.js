const { Dataset } = require("../models");
const { Op }  = require("sequelize");
const fs = require("fs");
const admZip = require("adm-zip");

module.exports = {
  async create (req, res) {
    try {
      const {name, admin, description, dataType, labelType, labelInfo, segments} = req.body;
      const file = req.file;
      console.log(name, admin, description, dataType, labelType, labelInfo, segments);
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      const dataset = await Dataset.create({name, admin, description, dataType, labelType, labelInfo: labelInfoParsed, segments});
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
  async edit (req, res) {
    try {
      let dataset = await Dataset.findByPk(req.params.datasetId);
      const {name, admin, description, dataType, labelType, labelInfo, segments} = req.body;
      if (req.user.name !== dataset.admin || req.user.name !== admin) {
        res.status(403).send({error: "您无权编辑此数据集"});
        return;
      }
      const file = req.file;
      console.log(name, description, dataType, labelType, labelInfo, segments);
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      dataset = await dataset.update({name, description, dataType, labelType, labelInfo: labelInfoParsed, segments});
      if (file) {
        const path = `./data/${dataset.id}`;
        // delete content in the directory if it exists
        if (fs.existsSync(path)) {
          fs.rmdirSync(path, {recursive: true});
        }
        fs.rmSync(path + ".zip");
        fs.writeFileSync(path + ".zip", fs.readFileSync(file.path));
        fs.unlinkSync(file.path);
      }
      res.send(dataset);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "编辑数据集时发生错误"});
    }
  },
  async delete (req, res) {
    try {
      const dataset = await Dataset.findByPk(req.params.datasetId);
      if (req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权删除此数据集"});
        return;
      }
      const path = `./data/${dataset.id}`;
      if (fs.existsSync(path)) {
        fs.rmdirSync(path, {recursive: true});
      }
      fs.rmSync(path + ".zip");
      await dataset.destroy();
      res.send(dataset);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "删除数据集时发生错误"});
    }
  },
  async index (req, res) {
    try {
      let datasets = null;
      const search = req.query.search;
      // admin = req.query.admin if it is not undefined, otherwise admin = null
      const admin = req.query.admin;
      const dataType = req.query.dataType;
      const labelType = req.query.labelType;
      const segments = req.query.segments === "true" ? true : req.query.segments === "false" ? false : null;
      console.log(admin, dataType, labelType, segments);
      datasets = await Dataset.findAll({
        where: {
          [Op.and]: [
            search && {[Op.or]: [
              {name: {[Op.substring]: search}},
              {admin: {[Op.substring]: search}},
              {description: {[Op.substring]: search}}
            ]},
            admin && {admin},
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
        zipEntries.forEach((zipEntry, index) => {
          zipFile.extractEntryTo(zipEntry.entryName, path, false, true);
        });
      }
      const name = fs.readdirSync(path).find((name) => name.startsWith(req.params.sampleId + "."));
      const file = fs.readFileSync(`${path}/${name}`, dataset.dataType === "text" ? "utf-8" : "binary");
      console.log(file.length);
      res.send(file);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取数据集文件时发生错误"});
    }
  }
};