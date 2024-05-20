const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models");
const config = require("./config");
const routes = require("./routes");
const { Op } = require("sequelize");
const cron = require("node-cron");

const app = express();
app.use(bodyParser.json()); // parses the body of the request
app.use(cors()); // allows requests from any origin
// app.use(morgan("combined")) // prints logs to the console
app.use(morgan("dev")); // prints logs to the console
require("./passport");
routes(app);

sequelize.sync().then(() => {
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`)
  })
}).catch((err) => {
  console.error(err)
});

function getAnswer(labels, dataset) {
  return {};
}

function equal(a, b) {
  return true;
}

function updateCorrectNum(labels, dataset) {
  const validLabels = labels.filter((label) => label.validated);
  if (validLabels.length === 0)
    return;
  const answer = getAnswer(validLabels, dataset);
  for (const label of labels) {
    const correctNum = Object.keys(answer).filter((key) => equal(answer[key], label[key])).length;
    label.update({correctNum});
  }
}

async function handleExpiredDatasets() {
  const { Dataset, Label, Invite } = require("./models");
  const datasets = await Dataset.findAll({where: {deadline: {[Op.lt]: new Date()}, settled: false}});
  for (const dataset of datasets) {
    const labels = await Label.findAll({where: {datasetId: dataset.id}});
    updateCorrectNum(labels, dataset);
    for (const label of labels) {
      const invite = await Invite.findOne({where: {datasetId: dataset.id, receiver: label.labeler}});
      if (invite) {
        await invite.destroy();
      }
    }
    await dataset.update({settled: true});
  }
}

cron.schedule("0 0 * * *", () => {
  console.log("Handling expired datasets");
  handleExpiredDatasets().then(() => {
    console.log("Expired datasets handled");
  }).catch((err) => {
    console.error(err);
  });
});