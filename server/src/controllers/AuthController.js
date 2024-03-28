const { User } = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config");

function jwtSignUser(user) {
  const ONE_WEEK = 60 * 60 * 24 * 7;
  return jwt.sign(user, config.auth.jwtSecret, {expiresIn: ONE_WEEK});
}

module.exports = {
  async register (req, res) {
    try {
      const user = await User.create(req.body); // throws an error if there is a duplicate email, since we the email field is set to unique
      const userJson = user.toJSON();
      res.send({user: userJson, token: jwtSignUser(userJson)});
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "邮箱已有人使用"});
    }
  },
  async login (req, res) {
    try {
      const {email, password} = req.body;
      const user = await User.findOne({where: {email: email}});
      if (!user) {
        return res.status(403).send({error: "邮箱或密码错误"});
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(403).send({error: "邮箱或密码错误"});
      }
      const userJson = user.toJSON();
      res.send({user: userJson, token: jwtSignUser(userJson)});
    } catch(err) {
      console.log(err);
      res.status(500).send({error: "登录时发生错误"});
    }
  }
};