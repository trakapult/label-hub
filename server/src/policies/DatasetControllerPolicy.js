const Joi = require("joi");

module.exports = {
  async create(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      admin: Joi.string().required(),
      dataType: Joi.string().required(),
      labelType: Joi.string().required(),
      labelInfo: Joi.alternatives(
        Joi.string().pattern(new RegExp("^\\{\"min\":\"-?\\d+\",\"max\":\"-?\\d+\"\\}$")).required(),
        Joi.string().pattern(new RegExp("^\\[\"[^\"]+\"(,\"[^\"]+\")*\\]$")).required(),
        null
      ),
      segments: Joi.boolean().required()
    });
    const {error} = schema.validate(req.body);
    if (error) {
      console.log(req.body);
      console.log(error);
      res.status(400).send({error: "数据集信息不完整"});
    } else {
      next();
    }
  }
}