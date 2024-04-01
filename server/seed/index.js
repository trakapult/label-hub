const { sequelize, User, Dataset } = require("../src/models");
const fs = require("fs");
const users = require("./users.json");
const datasets = require("./datasets.json");

async function seed () {
  await sequelize.sync({force: true});
  console.log("Database synced");
  await User.bulkCreate(users);
  console.log("Users created");
  await Dataset.bulkCreate(datasets);
  console.log("Datasets created");
  if (fs.existsSync("./data")) {
    fs.rmSync("./data", {recursive: true});
  }
  fs.mkdirSync("./data");
  if (fs.existsSync("./update")) {
    fs.rmSync("./update", {recursive: true});
  }
  fs.mkdirSync("./update");
  fs.readdirSync("./seed/data").forEach(file => {
    fs.copyFileSync(`./seed/data/${file}`, `./data/${file}`);
  });
}

try {
  seed();
} catch (err) {
  console.log(err);
}