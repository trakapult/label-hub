const { sequelize, User } = require("../src/models");
const users = require("./users.json");

async function seed () {
  await sequelize.sync({ force: true });
  console.log("Database synced");
  User.bulkCreate(users);
}

try {
  seed();
} catch (err) {
  console.log(err);
}