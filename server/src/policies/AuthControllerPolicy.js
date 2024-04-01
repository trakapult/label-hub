const Joi = require("joi");

module.exports = {
  register(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,32}$")).required()
    });
    const {error} = schema.validate(req.body);
    if (error) {
      switch(error.details[0].context.key) {
        case "email":
          res.status(400).send({error: "邮箱格式错误"});
          break;
        case "password":
          res.status(400).send({error: "密码应为8-32个字符，且只能包含字母和数字"});
          break;
        default:
          res.status(400).send({error: "注册时发生错误"});
      }
    } else {
      next();
    }
  }
};