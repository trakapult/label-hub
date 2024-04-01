const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const AuthControllerPolicy = require("./policies/AuthControllerPolicy");
const AuthController = require("./controllers/AuthController");
const DatasetControllerPolicy = require("./policies/DatasetControllerPolicy");
const DatasetController = require("./controllers/DatasetController");


module.exports = (app) => {
  app.post("/register", AuthControllerPolicy.register, AuthController.register),
  app.post("/login", AuthController.login),
  app.post("/datasets", upload.single("file"), DatasetControllerPolicy.create, DatasetController.create),
  app.get("/datasets", DatasetController.index),
  app.get("/datasets/:datasetId", DatasetController.show)
};