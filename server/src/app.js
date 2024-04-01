console.log("Hello world!");

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
// app.use(morgan("dev")); // prints logs to the console
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