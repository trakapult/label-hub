const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models");
const config = require("./config");
const routes = require("./routes");
const cron = require("node-cron");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
require("./passport");
routes(app);

sequelize.sync().then(() => {
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server started on port ${config.port}`);
  })
}).catch((err) => {
  console.error(err);
});

const handleExpiredDatasets = require("./utils/handleExpiredDatasets");

cron.schedule("0 0 * * *", () => {
  console.log("Handling expired datasets");
  handleExpiredDatasets().then(() => {
    console.log("Expired datasets handled");
  }).catch((err) => {
    console.error(err);
  });
});