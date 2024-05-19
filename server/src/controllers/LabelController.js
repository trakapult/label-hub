const { Label, User, Dataset } = require('../models');
const fs = require("fs");
const assert = require("assert");

const getCorrectNum = (labels, answers) => {
  let correctNum = 0;
  for (const key in answers) {
    if (labels[key] === answers[key]) {
      correctNum++;
    }
  }
  return correctNum;
}

const updateCorrectNum = async (labels, dataset) => {
  const groudTruthPath = `./data/datasets/${dataset.id}/groundTruth.json`;
  let groudTruth = {};
  if (fs.existsSync(groudTruthPath)) {
    groudTruth = JSON.parse(fs.readFileSync(groudTruthPath));
  }
  const labelData = {}, validLabels = [];
  for (const label of labels) {
    if (label.labeledNum != dataset.sampleNum) continue;
    const path = `./data/labels/${dataset.id}/${label.labeler}.json`;
    assert(fs.existsSync(path), `标注文件${path}不存在`);
    labelData[label.labeler] = JSON.parse(fs.readFileSync(path));
    if (getCorrectNum(labelData[label.labeler], groudTruth) === Object.keys(groudTruth).length) {
      validLabels.push(label);
    }
  }
  if (validLabels.length < 5) return;
  const weights = {};
  for (let i = 0; i < dataset.sampleNum; i++) {
    weights[i] = {};
  }
  for (const label of validLabels) {
    for (const key in labelData[label.labeler]) {
      const answer = labelData[label.labeler][key];
      const weight = Math.log10(await User.findOne({where: {name: label.labeler}}).points + 1);
      weights[key][answer] = (weights[key][answer] || 0) + weight;
    }
  }
  const answers = {};
  for (const key in weights) {
    let maxWeight = 0, maxAnswer = null;
    for (const answer in weights[key]) {
      if (weights[key][answer] > maxWeight) {
        maxWeight = weights[key][answer];
        maxAnswer = answer;
      }
    }
    assert(maxAnswer !== null, `样本${key}没有标注`);
    answers[key] = maxAnswer;
  }
  for (const label of labels) {
    label.correctNum = getCorrectNum(labelData[label.labeler], answers);
    await label.save();
  }
}

module.exports = {
  async create (req, res) {
    try {
      const {datasetId, labeler, labelData} = req.body;
      if (req.user.name !== labeler) {
        res.status(403).send({error: "您无权上传此标注"});
        return;
      }
      const path = `./data/labels/${datasetId}/`;
      if (!fs.existsSync(path)) fs.mkdirSync(path);
      fs.writeFileSync(path + `${labeler}.json`, JSON.stringify(labelData));
      const dataset = await Dataset.findByPk(datasetId);
      const labeledNum = Object.keys(labelData).length;
      let label = await Label.findOne({where: {datasetId, labeler}});
      if (!label) {
        label = await Label.create({datasetId, labeler, labeledNum});
      } else {
        label.labeledNum = labeledNum;
        await label.save();
      }
      if (labeledNum === dataset.sampleNum) {
        if (dataset.type === "entertain") {
          const entertainPath = `./data/datasets/${datasetId}/entertain.json`;
          if (fs.existsSync(entertainPath)) {
            const answers = JSON.parse(fs.readFileSync(entertainPath)).answers;
            if (answers) {
              label.correctNum = getCorrectNum(labelData, answers);
              await label.save();
            }
          }
        } else {
          const labels = await Label.findAll({where: {datasetId}});
          updateCorrectNum(labels, dataset);
        }
      }
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
      const dataset = await Dataset.findByPk(datasetId);
      if (dataset.type === "entertrain") {
        res.send({});
        return;
      }
      if (dataset.type !== "public" && req.user.name !== dataset.admin && req.user.name !== labeler) {
        res.status(403).send({error: "您无权访问此标注记录"});
        return;
      }
      const labelData = fs.readFileSync(`./data/labels/${datasetId}/${labeler}.json`);
      res.send(JSON.parse(labelData));
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取标注记录时发生错误"});
    }
  }
};