const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const AuthControllerPolicy = require("./policies/AuthControllerPolicy");
const AuthController = require("./controllers/AuthController");
const UserController = require("./controllers/UserController");

const DatasetControllerPolicy = require("./policies/DatasetControllerPolicy");
const DatasetController = require("./controllers/DatasetController");

const LabelController = require("./controllers/LabelController");

const IsAuthenticated = require("./policies/IsAuthenticated");

module.exports = (app) => {
  app.post("/register", AuthControllerPolicy.register, AuthController.register),
  app.post("/login", AuthController.login),
  app.get("/user/:userName", IsAuthenticated, UserController.show),

  app.post("/datasets", [upload.single("file"), IsAuthenticated, DatasetControllerPolicy.create], DatasetController.create),
  app.get("/datasets", IsAuthenticated, DatasetController.showAll),
  app.get("/dataset/:datasetId", IsAuthenticated, DatasetController.show),
  app.put("/dataset/:datasetId", [upload.single("file"), IsAuthenticated, DatasetControllerPolicy.create], DatasetController.edit),
  app.delete("/dataset/:datasetId", IsAuthenticated, DatasetController.delete),
  app.get("/file/:datasetId/:sampleId", IsAuthenticated, DatasetController.sendFile),

  app.post("/label/:datasetId/:labeler", IsAuthenticated, LabelController.create),
  app.get("/label/:datasetId/:labeler", IsAuthenticated, LabelController.show),
  app.get("/labeledDatasets/:labeler", IsAuthenticated, LabelController.showDatasets),
  app.get("/labelRecords/:datasetId", IsAuthenticated, LabelController.showLabelRecords),
  app.get("/record/:datasetId/:labeler", IsAuthenticated, LabelController.sendLabelData)
};