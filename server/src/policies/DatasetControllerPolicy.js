const Joi = require("joi");

module.exports = {
  async create(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      admin: Joi.string().required(),
      type: Joi.string().valid("public", "private", "entertain").required(),
      dataType: Joi.string().valid("text", "image", "audio").required(),
      labelType: Joi.string().valid("categorical", "numerical", "textual").required(),
      labelInfo: Joi.alternatives(
        Joi.string().pattern(new RegExp("^\\{\"min\":\"-?\\d+\",\"max\":\"-?\\d+\"\\}$")).required(),
        Joi.string().pattern(new RegExp("^\\[\"[^\"]+\"(,\"[^\"]+\")*\\]$")).required(),
        "null"
      ).required(),
      segments: Joi.boolean().required()
    });
    let {error} = schema.validate(req.body);
    if (req.body.labelType === "numerical" && !error) {
      const {min, max} = JSON.parse(req.body.labelInfo);
      if (min > max) {
        error = "min应小于等于max";
      }
    }
    if (error) {
      console.error(error);
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