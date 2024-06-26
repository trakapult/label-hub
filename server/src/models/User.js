const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcrypt-nodejs"));
const config = require("../config");

function hashPassword (user) {
  const SALT_FACTOR = 8;
  if (!user.changed("password")) {
    return;
  }
  return bcrypt
    .genSaltAsync(SALT_FACTOR)
    .then(salt => bcrypt.hashAsync(user.password, salt, null))
    .then(hash => {user.setDataValue("password", hash)});
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    points: {
      type: DataTypes.INTEGER,
      defaultValue: config.rewardSystem.initialPoints,
      validate: {min: 0}
    }
  }, {
    hooks: {
      beforeSave: hashPassword
    }
  });
  User.prototype.comparePassword = function (password) {
    return bcrypt.compareAsync(password, this.password);
  }
  return User;
};