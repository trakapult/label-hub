const { User } = require("../models");

module.exports = {
  async register (req, res) {
    try {
      const user = await User.create(req.body); // throws an error if there is a duplicate email, since we the email field is set to unique
      res.send(user.toJSON());
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
      const isPasswordValid = password === user.password
      if (!isPasswordValid) {
        return res.status(403).send({error: "邮箱或密码错误"});
      }
      res.send(user.toJSON());
    } catch(err) {
      console.log(err);
      res.status(500).send({error: "登录时发生错误"});
    }
  }
};