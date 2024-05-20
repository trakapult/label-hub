const Joi = require("joi");

module.exports = {
  async create(req, res, next) {
    const schema = Joi.object({
      datasetId: Joi.number().required(),
      receiver: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,16}$")).required(),
      reward: Joi.number().required(),
      penalty: Joi.number().required()
    });
    let {error} = schema.validate(req.body);
    if (req.body.reward < 0 || req.body.penalty < 0) {
      error = "reward和penalty应为非负数";
    }
    if (error) {
      if (typeof error === "string") {
        res.status(400).send({error});
      } else {
        res.status(400).send({error: error.details[0].message});
      }
    } else {
      next();
    }
  }
}