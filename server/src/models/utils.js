const fs = require("fs");
const assert = require("assert");
const config = require("../config");

const savePoints = async (receiver, datasetId, reason, amount, add = false) => {
  const { Points } = require("../models");
  const points = await Points.findOne({where: {receiver, datasetId, reason}});
  if (points) {
    await points.update({amount: add ? points.amount + amount : amount});
    return;
  }
  await Points.create({receiver, datasetId, reason, amount});
}

const destroyPoints = async (receiver, datasetId, reason) => {
  const { Points } = require("../models");
  const points = await Points.findOne({where: {receiver, datasetId, reason}});
  if (points) {
    await points.destroy();
  }
}

const settleUploadReward = async (dataset) => {
  const amount = dataset.type === "public" ? config.rewardSystem.uploadPay * dataset.sampleNum : 0;
  await savePoints(dataset.admin, dataset.id, "upload", amount);
}

const retrieveUploadReward = async (dataset) => {
  await destroyPoints(dataset.admin, dataset.id, "upload");
}

const validate = (label, dataset) => {
  if (dataset.type === "entertain")
    return true;
  if (label.labeledNum !== dataset.sampleNum)
    return false;
  const settingsPath = `./data/datasets/${dataset.id}/settings.json`;
  if (!fs.existsSync(settingsPath))
    return true;
  const answers = JSON.parse(fs.readFileSync(settingsPath)).answers;
  if (!answers)
    return true;
  const labelPath = `./data/labels/${dataset.id}/${label.labeler}.json`;
  assert(fs.existsSync(labelPath), `Label file ${labelPath} does not exist`);
  const labelData = JSON.parse(fs.readFileSync(labelPath));
  const { getAccSum } = require("../utils/validate");
  return getAccSum(answers, labelData, dataset) >= dataset.sampleNum * config.rewardSystem.accRatio;
}

const settleLabelPayment = async (label, dataset) => {
  if (dataset.type === "entertain") {
    const amount = -dataset.reward * label.labeledNum;
    await savePoints(label.labeler, label.datasetId, "getLabelingReward", amount, true);
    return;
  }
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const amount = Math.min(admin.points, dataset.reward * label.labeledNum + config.rewardSystem.correctPay * label.accSum);
  await savePoints(label.labeler, label.datasetId, "getLabelingReward", amount);
  await savePoints(dataset.admin, label.datasetId, "payLabelingReward", -amount);
}

const retrieveLabelPayment = async (label, dataset) => {
  await destroyPoints(label.labeler, label.datasetId, "getLabelingReward");
  await destroyPoints(dataset.admin, label.datasetId, "payLabelingReward");
}

const settleInvitePayment = async (invite, label, dataset) => {
  if (dataset.type === "entertain") return;
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const accSum = label.accSum;
  const inaccSum = dataset.sampleNum - accSum;
  const amount = Math.min(admin.points, invite.reward * label.accSum - invite.penalty * inaccSum);
  await savePoints(invite.receiver, invite.datasetId, "getInviteReward", amount);
  await savePoints(dataset.admin, invite.datasetId, "payInviteReward", -amount);
}

module.exports = {
  settleUploadReward,
  retrieveUploadReward,
  validate,
  settleLabelPayment,
  retrieveLabelPayment,
  settleInvitePayment
};