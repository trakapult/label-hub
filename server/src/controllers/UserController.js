const { User } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  async showAll (req, res) {
    try {
      const {search} = req.query;
      const users = await User.findAll({
        where: {name: {[Op.like]: `%${search}%`}},
        order: [["points", "DESC"]],
        limit: 100
      });
      res.send(users);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取用户时发生错误"});
    }
  },
  async show (req, res) {
    try {
      const user = await User.findOne({where: {name: req.params.name}});
      res.send(user);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取用户时发生错误"});
    }
  }
};