const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const AuthControllerPolicy = require("./policies/AuthControllerPolicy");
const AuthController = require("./controllers/AuthController");
const DatasetControllerPolicy = require("./policies/DatasetControllerPolicy");
const DatasetController = require("./controllers/DatasetController");
const IsAuthenticated = require("./policies/IsAuthenticated");

module.exports = (app) => {
  app.post("/register", AuthControllerPolicy.register, AuthController.register),
  app.post("/login", AuthController.login),
  app.post("/datasets", [upload.single("file"), IsAuthenticated, DatasetControllerPolicy.create], DatasetController.create),
  app.get("/datasets", IsAuthenticated, DatasetController.index),
  app.get("/datasets/:datasetId", IsAuthenticated, DatasetController.show)
};