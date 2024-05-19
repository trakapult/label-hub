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

sequelize.sync()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server started on port ${config.port}`)
    })
  })
  .catch((err) => {
    console.error(err)
  });

async function handleExpiredInvites() {
  try {
    console.log("Handling expired invites");
    const { Dataset, Label, Invite, Points } = require("./models");
    const now = new Date();
    const invites = await Invite.findAll({where: {deadline: {[Op.lt]: now}}});
    for (const invite of invites) {
      if (invite.status === "accepted") {
        const dataset = await Dataset.findByPk(invite.datasetId);
        const label = await Label.findOne({where: {datasetId: invite.datasetId, labeler: invite.receiver}});
        const correctNum = label ? label.correctNum : 0;
        const incorrectNum = dataset.sampleNum - correctNum;
        const amount = invite.reward * correctNum - invite.penalty * incorrectNum;
        await Points.create({receiver: invite.receiver, datasetId: invite.datasetId, reason: "getInviteReward", amount});
        await Points.create({receiver: dataset.admin, datasetId: invite.datasetId, reason: "payInviteReward", amount: -amount});
      }
      await invite.destroy();
    }
  } catch (err) {
    console.error(err);
  }
}

cron.schedule("0 0 * * *", handleExpiredInvites);