const { sequelize, User, Dataset, Invite } = require("../src/models");
const fs = require("fs");
const admZip = require("adm-zip");
const users = require("./users.json");
const datasets = require("./datasets.json");
const invites = require("./invites.json");

const allowedFileTypes = ["txt", "jpg", "jpeg", "png", "bmp", "webp", "mp3", "wav", "flac"];

const isValid = (entryName) => {
  if (entryName.split(".").length < 2) return false;
  const extension = entryName.split(".").pop().toLowerCase();
  return allowedFileTypes.includes(extension);
}

async function seed () {
  await sequelize.sync({force: true});
  console.log("Database synced");
  
  for (const user of users) {
    await User.create(user);
  }
  // await User.bulkCreate(users);
  console.log("Users created");
  
  for (const dataset of datasets) {
    await Dataset.create(dataset);
  }
  console.log("Datasets created");

  for (const invite of invites) {
    await Invite.create(invite);
  }
  console.log("Invites created");

  if (fs.existsSync("./data"))
    fs.rmSync("./data", {recursive: true});
  fs.mkdirSync("./data");
  if (fs.existsSync("./uploads"))
    fs.rmSync("./uploads", {recursive: true});
  fs.mkdirSync("./uploads");

  fs.mkdirSync("./data/datasets");
  fs.readdirSync("./seed/datasets").forEach(file => {
    file.endsWith(".zip") && fs.copyFileSync(`./seed/datasets/${file}`, `./data/datasets/${file}`);
  });
  fs.readdirSync("./data/datasets").forEach(file => {
    const zipFile = new admZip(fs.readFileSync(`./data/datasets/${file}`));
    const zipEntries = zipFile.getEntries();
    const names = {};
    let index = 0;
    for (const zipEntry of zipEntries) {
      if (isValid(zipEntry.entryName)) {
        names[index++] = zipEntry.entryName;
      }
    }
    const path = `./data/datasets/${file.split(".")[0]}`;
    fs.writeFileSync(`${path}_names.json`, JSON.stringify(names));
  });

  fs.mkdirSync("./data/labels");
}

try {
  seed();
} catch (err) {
  console.error(err);
}