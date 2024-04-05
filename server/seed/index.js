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
  if (fs.existsSync("./uploads")) {
    fs.rmSync("./uploads", {recursive: true});
  }
  fs.mkdirSync("./uploads");

  fs.mkdirSync("./data/datasets");
  fs.readdirSync("./seed/datasets").forEach(file => {
    file.endsWith(".zip") && fs.copyFileSync(`./seed/datasets/${file}`, `./data/datasets/${file}`);
  });

  fs.mkdirSync("./data/labels");
}

try {
  seed();
} catch (err) {
  console.log(err);
}