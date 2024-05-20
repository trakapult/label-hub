const fs = require("fs")
const path = require("path")
const Sequelize = require("sequelize")
const config = require("../config")
const db = {}

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
);

fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file !== "utils.js")
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
});

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db