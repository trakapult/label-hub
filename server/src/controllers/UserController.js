const { User } = require('../models');

module.exports = {
  async show (req, res) {
    try {
      const user = await User.findOne({where: {name: req.params.userName}});
      res.send(user);
    } catch(err) {
      console.log(err);
      res.status(400).send({error: "获取用户时发生错误"});
    }
  }
};