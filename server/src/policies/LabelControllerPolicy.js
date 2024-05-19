const Joi = require("joi");

module.exports = {
  async create(req, res, next) {
    const schema = Joi.object({
      datasetId: Joi.number().required(),
      labeler: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,16}$")).required(),
      labelData: Joi.object().required()
    });
    const {error} = schema.validate(req.body);
    if (error) {
      console.error(error);
      res.status(400).send({error: error.details[0].message});
    } else {
      next();
    }
  }
}