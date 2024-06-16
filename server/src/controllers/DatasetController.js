const { Dataset } = require("../models");
const { Op }  = require("sequelize");
const sequelize = require("sequelize");
const fs = require("fs");
const admZip = require("adm-zip");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);
const config = require("../config");

const allowedFileTypes = {
  text: ["txt"],
  image: ["jpg", "jpeg", "png", "bmp", "webp"],
  audio: ["mp3", "wav", "flac"]
};

const isValid = (entryName, dataType) => {
  if (entryName.split(".").length < 2) return false;
  const extension = entryName.split(".").pop().toLowerCase();
  return allowedFileTypes[dataType].includes(extension);
}

const saveZip = (path, file, dataType) => {
  const zipFile = new admZip(fs.readFileSync(file.path));
  const zipEntries = zipFile.getEntries();
  const names = {};
  let index = 0;
  for (const zipEntry of zipEntries) {
    if (isValid(zipEntry.entryName, dataType)) {
      names[index++] = zipEntry.entryName;
    }
  }
  removeFiles(path);
  fs.writeFileSync(path + ".zip", fs.readFileSync(file.path));
  fs.writeFileSync(`${path}_names.json`, JSON.stringify(names));
  fs.unlinkSync(file.path);
  return true;
};

const extractZip = (path) => {
  if (fs.existsSync(path)) return;
  const zipFile = new admZip(fs.readFileSync(path + ".zip"));
  zipFile.extractAllTo(path, true);
  const settings = JSON.parse(fs.readFileSync(`${path}/settings.json`));
  const names = JSON.parse(fs.readFileSync(`${path}_names.json`));
  const ids = {};
  for (const key in names)
    ids[names[key]] = parseInt(key);
  if (settings.graph) {
    const graph = settings.graph, graphWithIds = {};
    for (const key in graph) {
      const newKey = ids[key];
      if (typeof graph[key] === "object") {
        const newValues = {};
        for (const value in graph[key])
          newValues[value] = ids[graph[key][value]];
        graphWithIds[newKey] = newValues;
      } else {
        graphWithIds[newKey] = ids[graph[key]];
      }
    }
    settings.graph = graphWithIds;
  }
  if (settings.answers) {
    const answers = settings.answers, answersWithIds = {};
    for (const key in answers)
      answersWithIds[ids[key]] = answers[key];
    settings.answers = answersWithIds;
  }
  fs.writeFileSync(`${path}/settings.json`, JSON.stringify(settings));
};

const removeFiles = (path) => {
  if (fs.existsSync(path))
    fs.rmSync(path, {recursive: true});
  if (fs.existsSync(path + ".zip"))
    fs.rmSync(path + ".zip");
  if (fs.existsSync(`${path}_names.json`))
    fs.rmSync(`${path}_names.json`);
}

module.exports = {
  async create (req, res) {
    try {
      const {name, admin, description, type, dataType, labelType, labelInfo, segments, deadline} = req.body;
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
      let sampleNum = zipFile.getEntries().filter((zipEntry) => isValid(zipEntry.entryName, dataType)).length;
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      const dataset = await Dataset.create({name, admin, description, sampleNum, type, dataType, labelType, labelInfo: labelInfoParsed, segments, deadline});
      const path = `./data/datasets/${dataset.id}`;
      saveZip(path, file, dataType);
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
        sampleNum = zipFile.getEntries().filter((zipEntry) => isValid(zipEntry.entryName, dataType)).length;
        dataset.changed("sampleNum", true);
      }
      let labelInfoParsed = null;
      if (labelType === "numerical" || labelType === "categorical") {
        labelInfoParsed = JSON.parse(labelInfo);
      }
      dataset = await dataset.update({name, description, sampleNum, dataType, labelType, labelInfo: labelInfoParsed, segments});
      if (file) {
        const path = `./data/datasets/${dataset.id}`;
        saveZip(path, file, dataType);
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
        attributes: {
          include: [[
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Labels"
              WHERE "Labels"."datasetId" = "Dataset"."id" AND "Labels"."validated" = true
            )`),
            "labelerNum"
          ]]
        },
        order: [["createdAt", "DESC"]],
        limit: config.dataset.showLimit
      });
      res.send(datasets);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取数据集时发生错误"});
    }
  },
  async show (req, res) {
    try {
      const dataset = (await Dataset.findByPk(req.params.datasetId)).toJSON();
      const path = `./data/datasets/${dataset.id}`;
      extractZip(path);
      const settingsPath = `${path}/settings.json`;
      if (fs.existsSync(settingsPath))
        dataset.settings = JSON.parse(fs.readFileSync(settingsPath));
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
      const name = JSON.parse(fs.readFileSync(`${path}_names.json`))[sampleId];
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
        const size = width * height, maxSize = config.dataset.imageMaxSize;
        if (dataset.segments === false && size > maxSize) {
          width = Math.ceil(width * Math.sqrt(maxSize / size));
          height = Math.ceil(height * Math.sqrt(maxSize / size));
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