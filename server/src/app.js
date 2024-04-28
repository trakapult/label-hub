const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models");
const config = require("./config");
const routes = require("./routes");

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
    console.log(err)
  });

async function handleExpiredInvites() {
  const { User, Dataset, Label, Invite } = require("./models");
  try {
    const invites = await Invite.findAll();
    const now = new Date();
    for (const invite of invites) {
      if (now > invite.deadline) {
        const user = await User.findOne({where: {name: invite.receiver}});
        const dataset = await Dataset.findByPk(invite.datasetId);
        const label = await Label.findOne({where: {datasetId: invite.datasetId, labeler: invite.receiver}});
        const correctNum = label ? label.correctNum : 0;
        const incorrectNum = dataset.sampleNum - correctNum;
        user.score = Math.max(0, user.score + invite.reward * correctNum - invite.penalty * incorrectNum);
        await user.save();
        await invite.destroy();
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function checkDate() {
  console.log("Checking date");
  const fs = require("fs");
  const path = "./data/lastUpdateDate.txt";
  if (!fs.existsSync(path || fs.readFileSync(path, "utf-8") < new Date().toISOString())) {
    handleExpiredInvites();
    fs.writeFileSync(path, new Date().toISOString());
  }
}

checkDate();
setInterval(checkDate, 1000 * 60 * 60 * 24);