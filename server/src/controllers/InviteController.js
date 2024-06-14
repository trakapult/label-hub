const { Invite, Dataset } = require('../models');

module.exports = {
  async create (req, res) {
    try {
      const {datasetId, receiver, reward, penalty} = req.body;
      const dataset = await Dataset.findByPk(datasetId);
      if (req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权发送此邀请"});
        return;
      }
      let invite = await Invite.findOne({where: {datasetId, receiver}});
      if (!invite) invite = await Invite.create({datasetId, receiver, reward, penalty});
      res.send(invite);
    }
    catch(err) {
      console.error(err);
      res.status(400).send({error: "发送邀请时发生错误"});
    }
  },
  async showSent (req, res) {
    try {
      const dataset = await Dataset.findByPk(req.params.datasetId);
      if (req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权访问这些邀请"});
        return;
      }
      const invites = await Invite.findAll({
        where: {datasetId: req.params.datasetId},
        order: [["updatedAt", "DESC"]]
      });
      res.send(invites);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取邀请时发生错误"});
    }
  },
  async showReceived (req, res) {
    try {
      const invites = await Invite.findAll({
        where: {receiver: req.user.name},
        include: [{model: Dataset, as: "dataset", attributes: ["name", "admin"]}],
        order: [["updatedAt", "DESC"]]
      });
      res.send(invites);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "获取邀请时发生错误"});
    }
  },
  async delete (req, res) {
    try {
      const {datasetId, receiver} = req.params;
      const dataset = await Dataset.findByPk(datasetId);
      if (req.user.name !== dataset.admin) {
        res.status(403).send({error: "您无权撤回此邀请"});
        return;
      }
      await Invite.destroy({where: {datasetId, receiver}});
      res.send({message: "邀请已撤回"});
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "撤回邀请时发生错误"});
    }
  },
  async handleResponse (req, res) {
    try {
      const {datasetId} = req.params;
      const {response} = req.body;
      let invite = await Invite.findOne({where: {datasetId, receiver: req.user.name}});
      if (!invite) {
        res.status(404).send({error: "未找到邀请"});
        return;
      }
      const status = response === "accept" ? "已接受" : response === "reject" ? "已拒绝" : "等待回复";
      invite.status = status;
      await invite.save();
      res.send(invite);
    } catch(err) {
      console.error(err);
      res.status(400).send({error: "处理邀请回复时发生错误"});
    }
  }
};