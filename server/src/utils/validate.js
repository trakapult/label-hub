const fs = require("fs");

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
  if (dataset.dataType === "image") return Math.min(labelInfo.width, labelInfo.height) * 0.05;
  if (dataset.dataType === "audio") return 0.05;
  return -1;
}

function getAnswer_(data, weights, dataset) {
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
    for (let i = 0; i < b.length; i++) {
      let found = false;
      for (let j = 0; j < a.length; j++) {
        if (equal(a[j].value, b[i], threshold)) {
          a[j] = mergeSingle(a[j], b[i]);
          found = true;
          break;
        }
      }
      if (!found) a.push({value: b[i], weight: weights[idx], idx});
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

async function getAnswer(labels, dataset) {
  const { User } = require("../models");
  const data = {}, weights = [];
  for (const label of labels) {
    const labelData = JSON.parse(fs.readFileSync(`./data/${label.datasetId}/${label.labeler}.json`));
    for (const sampleId in labelData) {
      if (!data[sampleId]) data[sampleId] = [];
      data[sampleId].push(labelData[sampleId]);
    }
    const user = await User.findOne({where: {name: label.labeler}});
    const weight = Math.log10(user.points + 1);
    weights.push(weight);
  }
  return getAnswer_(data, weights, dataset);
}

function getAcc(a, b, threshold = -1) {
  if (threshold === -1) {
    return a === b ? 1 : 0;
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

function getAccSum(answer, label, dataset) {
  const threshold = getThreshold(dataset);
  let accSum = 0;
  for (const sampleId in answer) {
    accSum += getAcc(answer[sampleId], label[sampleId], threshold);
  }
  return accSum;
}

async function updateAccSum(labels, dataset) {
  const validLabels = labels.filter((label) => label.validated);
  if (validLabels.length === 0)
    return;
  const answer = await getAnswer(validLabels, dataset);
  for (const label of labels) {
    const accSum = getAccSum(answer, label, dataset);
    await label.update({accSum});
  }
}

module.exports = { getAnswer_, getAnswer, getAcc, getAccSum, updateAccSum };