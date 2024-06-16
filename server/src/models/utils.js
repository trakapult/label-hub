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
  const amount = config.rewardSystem.uploadReward[dataset.type] * dataset.sampleNum;
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
  if (!answers) return true;
  const labelPath = `./data/labels/${dataset.id}/${label.labeler}.json`;
  assert(fs.existsSync(labelPath), `Label file ${labelPath} does not exist`);
  const labelData = JSON.parse(fs.readFileSync(labelPath));
  const { getAccSum } = require("../utils/validate");
  const accSum = getAccSum(answers, labelData, dataset);
  return accSum >= Object.keys(answers).length * config.rewardSystem.accRatio;
}

const settleLabelPayment = async (label, dataset) => {
  if (dataset.type === "entertain") {
    const amount = -dataset.reward * label.labeledNum;
    await savePoints(label.labeler, label.datasetId, `labelGet ${label.id}`, amount, true);
    return;
  }
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const labelingReward = Math.min(admin.points, dataset.reward * label.labeledNum);
  await savePoints(label.labeler, label.datasetId, `labelGet ${label.id}`, labelingReward);
  await savePoints(dataset.admin, label.datasetId, `labelPay ${label.id}`, -labelingReward);
  const correctReward = Math.min(admin.points - labelingReward,  Math.ceil(config.rewardSystem.correctPay * label.accSum));
  await savePoints(label.labeler, label.datasetId, `correctGet ${label.id}`, correctReward);
  await savePoints(dataset.admin, label.datasetId, `correctPay ${label.id}`, -correctReward);
}

const retrieveLabelPayment = async (label, dataset) => {
  await destroyPoints(label.labeler, label.datasetId, `labelGet ${label.id}`);
  await destroyPoints(dataset.admin, label.datasetId, `labelPay ${label.id}`);
  await destroyPoints(label.labeler, label.datasetId, `correctGet ${label.id}`);
  await destroyPoints(dataset.admin, label.datasetId, `correctPay ${label.id}`);
}

const settleInvitePayment = async (invite, label, dataset) => {
  if (dataset.type === "entertain") return;
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const accSum = label ? label.accSum : 0;
  const inaccSum = dataset.sampleNum - accSum;
  const amount = Math.min(admin.points, Math.ceil(invite.reward * accSum - invite.penalty * inaccSum));
  await savePoints(invite.receiver, invite.datasetId, `inviteGet ${invite.id}`, amount);
  await savePoints(dataset.admin, invite.datasetId, `invitePay ${invite.id}`, -amount);
}

module.exports = {
  settleUploadReward,
  retrieveUploadReward,
  validate,
  settleLabelPayment,
  retrieveLabelPayment,
  settleInvitePayment
};