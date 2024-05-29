const { Op } = require("sequelize");
const { updateAccSum } = require("./validate");

async function handleExpiredDatasets(date) {
  const { Dataset, Label, Invite } = require("./models");
  const datasets = await Dataset.findAll({where: {deadline: {[Op.lt]: date}, settled: false}});
  for (const dataset of datasets) {
    const labels = await Label.findAll({where: {datasetId: dataset.id}});
    await updateAccSum(labels, dataset);
    for (const label of labels) {
      const invite = await Invite.findOne({where: {datasetId: dataset.id, receiver: label.labeler}});
      if (invite) {
        await invite.destroy();
      }
    }
    await dataset.update({settled: true});
  }
}

module.exports = handleExpiredDatasets;