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
      res.send({user, token: jwtSignUser(user.toJSON())});
    } catch(err) {
      console.log(err);
      // check if the error is due to a duplicate email or a duplicate username
      if (err.errors[0].message === "name must be unique") {
        res.status(400).send({error: "用户名已被注册"});
      } else if (err.errors[0].message === "email must be unique") {
        res.status(400).send({error: "邮箱已被注册"});
      } else {
        res.status(400).send({error: "注册时发生错误"});
      }
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
      res.send({user, token: jwtSignUser(user.toJSON())});
    } catch(err) {
      console.log("err\n\n\n\n\n\n",err);
      res.status(500).send({error: "登录时发生错误"});
    }
  }
};