const { Op } = require("sequelize");
const { updateAccSum } = require("./validate");

async function handleExpiredDatasets(date = null) {
  if (!date) date = new Date().toISOString().split("T")[0];
  const { Dataset, Label, Invite } = require("../models");
  const datasets = await Dataset.findAll({where: {deadline: {[Op.lt]: date}, settled: false}});
  for (const dataset of datasets) {
    const labels = await Label.findAll({where: {datasetId: dataset.id}});
    await updateAccSum(labels, dataset);
    const invites = await Invite.findAll({where: {datasetId: dataset.id}});
    for (const invite of invites) {
      await invite.destroy();
    }
    await dataset.update({settled: true});
  }
}

module.exports = handleExpiredDatasets;