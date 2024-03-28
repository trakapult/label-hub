const AuthControllerPolicy = require("./policies/AuthControllerPolicy");
const AuthController = require("./controllers/AuthController");

module.exports = (app) => {
  app.post("/register", AuthControllerPolicy.register, AuthController.register),
  app.post("/login", AuthController.login)
};