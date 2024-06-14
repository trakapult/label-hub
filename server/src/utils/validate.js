const fs = require("fs");
const config = require("../config");

const equal = (sa, sb, threshold = -1) => {
  if (sa.label !== sb.label) return false;
  if (threshold === -1) return true;
  for (const key in sa) {
    if (key !== "label" && Math.abs(sa[key] - sb[key]) > threshold) {
      return false;
    }
  }
  return true;
}

function getThreshold(dataset) {
  if (!dataset.segments) return -1;
  const labelInfo = JSON.parse(dataset.labelInfo);
  if (dataset.dataType === "text") return 0;
  if (dataset.dataType === "image") return Math.min(labelInfo.width, labelInfo.height) * config.rewardSystem.threshold;
  if (dataset.dataType === "audio") return config.rewardSystem.threshold;
  return -1;
}

function getAnswer(data, weights, dataset) {
  const answer = {};
  const threshold = getThreshold(dataset);
  if (threshold === -1) {
    for (const sampleId in data) {
      const candidates = {};
      for (let i = 0; i < weights.length; i++) {
        const label = data[sampleId][i];
        if (!candidates[label]) candidates[label] = 0;
        candidates[label] += weights[i];
      }
      let maxWeight = 0, maxLabel = null;
      for (const label in candidates) {
        if (candidates[label] > maxWeight) {
          maxWeight = candidates[label];
          maxLabel = label;
        }
      }
      answer[sampleId] = maxLabel;
    }
    return answer;
  }
  const merge = (a, b, idx) => {
    const mergeSingle = (sa, sb) => {
      const wa = sa.weight, wb = weights[idx];
      for (const key in sa.value) {
        if (key !== "label") {
          sa.value[key] = (wa * sa.value[key] + wb * sb[key]) / (wa + wb);
        }
      }
      if (sa.idx < idx) {
        sa.weight += wb;
        sa.idx = idx;
      }
      return sa;
    }
    const uniq = [];
    for (let i = 0; i < b.length; i++) {
      let found = false;
      for (let j = 0; j < uniq.length; j++) {
        if (equal(uniq[j], b[i], threshold)) {
          found = true;
          break;
        }
      }
      if (!found) uniq.push(b[i]);
    }
    for (let i = 0; i < uniq.length; i++) {
      let found = false;
      for (let j = 0; j < a.length; j++) {
        if (equal(a[j].value, uniq[i], threshold)) {
          a[j] = mergeSingle(a[j], uniq[i]);
          found = true;
          tmpreak;
        }
      }
      if (!found) a.push({value: uniq[i], weight: weights[idx], idx});
    }
    return a;
  }
  const res = {};
  for (const sampleId in data) {
    if (!res[sampleId]) res[sampleId] = [];
    for (let i = 0; i < weights.length; i++) {
      res[sampleId] = merge(res[sampleId], data[sampleId][i], i);
    }
  }
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  for (const sampleId in res) {
    answer[sampleId] = []
    for (const label of res[sampleId]) {
      if (label.weight > weightSum / 2) {
        answer[sampleId].push(label.value);
      }
    }
  }
  return answer;
}

async function getDataAndWeights(labels, dataset) {
  const { User } = require("../models");
  const data = {}, weights = [];
  for (const label of labels) {
    const labelData = JSON.parse(fs.readFileSync(`./data/labels/${label.datasetId}/${label.labeler}.json`));
    for (const sampleId in labelData) {
      if (!data[sampleId]) data[sampleId] = [];
      data[sampleId].push(labelData[sampleId]);
    }
    const user = await User.findOne({where: {name: label.labeler}});
    const weight = Math.log10(user.points + 1);
    weights.push(weight);
  }
  return {data, weights};
}

function getAcc(a, b, threshold = -1) {
  console.log(a, b, threshold);
  if (threshold === -1) {
    return a == b ? 1 : 0;
  }
  let acc = 0;
  for (let i = 0; i < b.length; i++) {
    for (let j = 0; j < a.length; j++) {
      if (equal(a[j], b[i], threshold)) {
        acc++;
        break;
      }
    }
  }
  acc /= b.length;
  return acc;
}

function getAccSum(answer, labelData, dataset) {
  const threshold = getThreshold(dataset);
  let accSum = 0;
  for (const sampleId in answer) {
    accSum += getAcc(answer[sampleId], labelData[sampleId], threshold);
  }
  return accSum;
}

async function updateAccSum(labels, dataset) {
  const validLabels = labels.filter((label) => label.validated);
  const dirPath = `./data/labels/${dataset.id}`;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const path = `${dirPath}/correct_labels.json`;
  if (validLabels.length === 0) {
    fs.writeFileSync(path, JSON.stringify({}));
    return;
  }
  const {data, weights} = getDataAndWeights(validLabels, dataset);
  const answer = getAnswer(data, weights, dataset);
  fs.writeFileSync(path, JSON.stringify(answer));
  for (const label of labels) {
    const labelData = JSON.parse(fs.readFileSync(`${dirPath}/${label.labeler}.json`));
    const accSum = getAccSum(answer, labelData, dataset);
    await label.update({accSum});
  }
}

module.exports = { getAnswer, getAcc, getAccSum, updateAccSum };