const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const AuthControllerPolicy = require("./policies/AuthControllerPolicy");
const AuthController = require("./controllers/AuthController");
const UserController = require("./controllers/UserController");
const DatasetControllerPolicy = require("./policies/DatasetControllerPolicy");
const DatasetController = require("./controllers/DatasetController");
const IsAuthenticated = require("./policies/IsAuthenticated");

module.exports = (app) => {
  app.post("/register", AuthControllerPolicy.register, AuthController.register),
  app.post("/login", AuthController.login),
  app.get("/user/:userName", IsAuthenticated, UserController.show),
  app.post("/datasets", [upload.single("file"), IsAuthenticated, DatasetControllerPolicy.create], DatasetController.create),
  app.get("/datasets", IsAuthenticated, DatasetController.index),
  app.get("/dataset/:datasetId", IsAuthenticated, DatasetController.show),
  app.get("/file/:datasetId/:sampleId", IsAuthenticated, DatasetController.sendFile)
};