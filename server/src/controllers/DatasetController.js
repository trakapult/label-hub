const { Dataset } = require("../models");
const { Op }  = require("sequelize");
const fs = require("fs");
const admZip = require("adm-zip");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);

const saveZip = (path, file) => {
  const zipFile = new admZip(fs.readFileSync(file.path));
  const zipEntries = zipFile.getEntries();
  if (zipEntries.some((zipEntry, index) =>
    zipEntry.entryName.split("/").length > 1
    || zipEntry.entryName.split(".").length !== 2
    || parseInt(zipEntry.entryName.split(".")[0]) !== index)) {
    fs.unlinkSync(file.path);
    return false;
  }
  removeFiles(path);
  fs.writeFileSync(path + ".zip", fs.readFileSync(file.path));
  fs.unlinkSync(file.path);
  return true;
};

const extractZip = (path) => {
  if (fs.existsSync(path)) {
    return;
  }
  const zipFile = new admZip(fs.readFileSync(path + ".zip"));
  const zipEntries = zipFile.getEntries();
  zipEntries.forEach((zipEntry) => {
    zipFile.extractEntryTo(zipEntry.entryName, path, false, true);
  });
};

const removeFiles = (path) => {
  if (fs.existsSync(path)) {
    fs.rmdirSync(path, {recursive: true});
  }
  if (fs.existsSync(path + ".zip")) {
    fs.rmSync(path + ".zip");
  }
}

module.exports = {
  async create (req, res) {
    try {
      const {name, admin, description, dataType, labelType, labelInfo, segments} = req.body;
      const file = req.file;
      if (req.user.name !== admin) {
        res.status(403).send({error: "您无权创建此数据集"});
        return;
      }
      if (!file) {
        res.status(400).send({error: "数据集文件未上传"});
        return;
      }
      const sampleNum = new admZip(fs.readFileSync(file.path)).getEntries().length;
      console.log(name, admin, description, sampleNum, dataType, labelType, labelInfo, segments);
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      const dataset = await Dataset.create({name, admin, description, sampleNum, dataType, labelType, labelInfo: labelInfoParsed, segments});
      const path = `./data/datasets/${dataset.id}`;
      if (!saveZip(path, file)) {
        await dataset.destroy();
        res.status(400).send({error: "数据集文件格式错误"});
        return;
      }
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
      const {name, admin, description, dataType, labelType, labelInfo, segments} = req.body;
      let dataset = await Dataset.findByPk(req.params.datasetId);
      if (req.user.name !== dataset.admin || req.user.name !== admin) {
        res.status(403).send({error: "您无权编辑此数据集"});
        return;
      }
      const file = req.file;
      const sampleNum = file ? new admZip(fs.readFileSync(file.path)).getEntries().length : dataset.sampleNum;
      console.log(name, description, sampleNum, dataType, labelType, labelInfo, segments);
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      dataset = await dataset.update({name, description, sampleNum, dataType, labelType, labelInfo: labelInfoParsed, segments});
      if (file) {
        const path = `./data/datasets/${dataset.id}`;
        if (!saveZip(path, file)) {
          await dataset.destroy();
          res.status(400).send({error: "数据集文件格式错误"});
          return;
        }
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
      const path = `./data/datasets/${dataset.id}`;
      removeFiles(path);
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
      const path = `./data/datasets/${dataset.id}`;
      extractZip(path);
      const name = fs.readdirSync(path).find((name) => name.startsWith(req.params.sampleId + "."));
      const file = fs.readFileSync(`${path}/${name}`, dataset.dataType === "text" ? "utf-8" : "binary");
      console.log(file.length);
      let fileInfo = null;
      if (dataset.dataType === "text") {
        fileInfo = {length: file.length};
      } else if (dataset.dataType === "image") {
        const {width, height} = await sharp(`${path}/${name}`).metadata();
        fileInfo = {width, height};
      } else if (dataset.dataType === "audio") {
        const getDuration = (filePath) => {
          return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
              if (err) reject(err);
              resolve(metadata.format.duration);
            });
          });
        };
        const duration = await getDuration(`${path}/${name}`);
        console.log("duration", duration);
        fileInfo = {duration};
      }
      res.send({file, fileInfo});
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取样本时发生错误"});
    }
  }
};