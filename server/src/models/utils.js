const fs = require("fs");
const assert = require("assert");

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
  const amount = dataset.type === "public" ? 20 * dataset.sampleNum : 0;
  savePoints(dataset.admin, dataset.id, "upload", amount);
}

const retrieveUploadReward = async (dataset) => {
  destroyPoints(dataset.admin, dataset.id, "upload");
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
  return Object.keys(answers).every(key => answers[key] === labelData[key]);
}

const settleLabelPayment = async (label, dataset) => {
  if (dataset.type === "entertain") {
    console.log("wwwwww", dataset.reward, label.labeledNum);
    const amount = -dataset.reward * label.labeledNum;
    savePoints(label.labeler, label.datasetId, "getLabelingReward", amount, true);
    return;
  }
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const amount = Math.min(admin.points, dataset.reward * label.labeledNum + 2 * label.correctNum);
  savePoints(label.labeler, label.datasetId, "getLabelingReward", amount);
  savePoints(dataset.admin, label.datasetId, "payLabelingReward", -amount);
}

const retrieveLabelPayment = async (label, dataset) => {
  destroyPoints(label.labeler, label.datasetId, "getLabelingReward");
  destroyPoints(dataset.admin, label.datasetId, "payLabelingReward");
}

const settleInvitePayment = async (invite, label, dataset) => {
  if (dataset.type === "entertain") return;
  const { User } = require("../models");
  const admin = await User.findOne({where: {name: dataset.admin}});
  const correctNum = label.correctNum;
  const incorrectNum = dataset.sampleNum - correctNum;
  const amount = Math.min(admin.points, invite.reward * label.correctNum - invite.penalty * incorrectNum);
  savePoints(invite.receiver, invite.datasetId, "getInviteReward", amount);
  savePoints(dataset.admin, invite.datasetId, "payInviteReward", -amount);
}

module.exports = {
  settleUploadReward,
  retrieveUploadReward,
  validate,
  settleLabelPayment,
  retrieveLabelPayment,
  settleInvitePayment
};