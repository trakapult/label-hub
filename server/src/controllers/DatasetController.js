const { Dataset, } = require("../models");
const { Op }  = require("sequelize");
const sequelize = require("sequelize");
const fs = require("fs");
const admZip = require("adm-zip");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);

const saveZip = (path, file) => {
  const zipFile = new admZip(fs.readFileSync(file.path));
  const zipEntries = zipFile.getEntries();
  const indices = [];
  const isValid = (entryName) => {
    if (entryName.split("/").length > 1) return false;
    if (entryName.split(".").length !== 2) return false;
    const firstPart = entryName.split(".")[0];
    if (firstPart === "entertain") return true;
    if (indices.includes(firstPart)) return false;
    indices.push(firstPart);
    return true;
  }
  if (zipEntries.some((zipEntry) => !isValid(zipEntry.entryName))) {
    fs.unlinkSync(file.path);
    return false;
  }
  removeFiles(path);
  fs.writeFileSync(path + ".zip", fs.readFileSync(file.path));
  fs.unlinkSync(file.path);
  return true;
};

const extractZip = (path) => {
  if (fs.existsSync(path)) return;
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
      const {name, admin, description, type, dataType, labelType, labelInfo, segments} = req.body;
      const file = req.file;
      if (req.user.name !== admin) {
        res.status(403).send({error: "您无权创建此数据集"});
        return;
      }
      if (!file) {
        res.status(400).send({error: "数据集文件未上传"});
        return;
      }
      const zipFile = new admZip(fs.readFileSync(file.path));
      let sampleNum = zipFile.getEntries().length;
      if (type === "entertain") {
        if (!zipFile.getEntry("entertain.json")) {
          fs.unlinkSync(file.path);
          res.status(400).send({error: "娱乐数据集应包含名为entertain.json的文件"});
          return;
        }
        sampleNum -= 1;
      }
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      const dataset = await Dataset.create({name, admin, description, sampleNum, type, dataType, labelType, labelInfo: labelInfoParsed, segments});
      const path = `./data/datasets/${dataset.id}`;
      if (!saveZip(path, file)) {
        await dataset.destroy();
        res.status(400).send({error: "数据集文件格式错误"});
        return;
      }
      res.send(dataset);
    } catch(err) {
      console.error(err);
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
      let sampleNum = dataset.sampleNum;
      if (file) {
        const zipFile = new admZip(fs.readFileSync(file.path));
        sampleNum = zipFile.getEntries().length;
        if (dataset.type === "entertain") {
          if (!zipFile.getEntry("entertain.json")) {
            fs.unlinkSync(file.path);
            res.status(400).send({error: "娱乐数据集应包含名为entertain.json的文件"});
            return;
          }
          sampleNum -= 1;
        }
      }
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
      console.error(err);
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
      console.error(err);
      res.status(400).send({error: "删除数据集时发生错误"});
    }
  },
  async showAll (req, res) {
    try {
      let datasets = null;
      const {search, admin, type, dataType, labelType} = req.query;
      const segments = req.query.segments === "yes" ? true : req.query.segments === "no" ? false : null;
      datasets = await Dataset.findAll({
        where: {
          [Op.and]: [
            search && {[Op.or]: [
              {name: {[Op.substring]: search}},
              {admin: {[Op.substring]: search}},
              {description: {[Op.substring]: search}}
            ]},
            admin && {admin},
            type && {type},
            dataType && {dataType},
            labelType && {labelType},
            segments !== null && {segments}
          ]
        },
        // TODO: add count of labels with validated = true as labelerNum
        attributes: {
          include: [[
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Labels"
              WHERE "Labels"."datasetId" = "Dataset"."id" AND "Labels"."validated" = true)`
            ),
            "labelerNum"
          ]]
        },
        order: [["createdAt", "DESC"]],
        limit: 100
      });
      res.send(datasets);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async show (req, res) {
    try {
      const dataset = await Dataset.findByPk(req.params.datasetId);
      res.send(dataset);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async sendFile (req, res) {
    try {
      const {datasetId, sampleId} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      const path = `./data/datasets/${dataset.id}`;
      extractZip(path);
      const name = fs.readdirSync(path).find((name) => name.startsWith(sampleId + "."));
      if (!name) {
        res.send({});
        return;
      }
      const filePath = `${path}/${name}`;
      let file = null, fileInfo = null; 
      if (dataset.dataType === "text") {
        file = fs.readFileSync(filePath, "utf-8");
        fileInfo = {length: file.length};
      } else if (dataset.dataType === "image") {
        file = fs.readFileSync(filePath).toString("binary");
        const image = sharp(filePath);
        let {width, height} = await image.metadata();
        if (dataset.segments === false && height > 300) {
          width = Math.ceil(width / height * 300);
          height = 300;
          const buffer = await image.resize(width, height).toBuffer();
          file = buffer.toString("binary");
        }
        fileInfo = {width, height};
      } else if (dataset.dataType === "audio") {
        file = fs.readFileSync(filePath, "binary");
        const duration = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            resolve(metadata.format.duration);
          });
        });
        fileInfo = {duration};
      }
      res.send({file, fileInfo});
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取样本时发生错误"});
    }
  }
};