const Joi = require("joi");

module.exports = {
  async create(req, res, next) {
    const schema = Joi.object({
      userId: Joi.number().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      dataType: Joi.string().required(),
      labelType: Joi.string().required(),
      segment: Joi.boolean().required()
    });
    const {error} = schema.validate(req.body);
    if (error) {
      res.status(400).send({error: "数据集信息不完整"});
    } else {
      next();
    }
  }
}