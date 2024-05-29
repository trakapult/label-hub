const multer = require("multer");
const upload = multer({dest: "uploads/"});

const AuthControllerPolicy = require("./policies/AuthControllerPolicy");
const AuthController = require("./controllers/AuthController");
const UserController = require("./controllers/UserController");

const DatasetControllerPolicy = require("./policies/DatasetControllerPolicy");
const DatasetController = require("./controllers/DatasetController");

const LabelController = require("./controllers/LabelController");
const LabelControllerPolicy = require("./policies/LabelControllerPolicy");

const InviteController = require("./controllers/InviteController");
const InviteControllerPolicy = require("./policies/InviteControllerPolicy");

const IsAuthenticated = require("./policies/IsAuthenticated");

module.exports = (app) => {
  app.post("/register", AuthControllerPolicy.register, AuthController.register),
  app.post("/login", AuthController.login),
  app.get("/users", UserController.showAll),
  app.get("/user/:name", UserController.show),

  app.post("/datasets", [upload.single("file"), IsAuthenticated, DatasetControllerPolicy.create], DatasetController.create),
  app.get("/datasets", DatasetController.showAll),
  app.put("/dataset/:datasetId", [upload.single("file"), IsAuthenticated, DatasetControllerPolicy.create], DatasetController.edit),
  app.get("/dataset/:datasetId", DatasetController.show),
  app.delete("/dataset/:datasetId", IsAuthenticated, DatasetController.delete),
  app.get("/file/:datasetId/:sampleId", IsAuthenticated, DatasetController.sendFile),

  app.post("/label", [IsAuthenticated, LabelControllerPolicy.create], LabelController.create),
  app.get("/label/:datasetId/:labeler", IsAuthenticated, LabelController.show),
  app.get("/labeledDatasets/:labeler", IsAuthenticated, LabelController.showDatasets),
  app.get("/labelRecords/:datasetId", IsAuthenticated, LabelController.showLabelRecords),
  app.get("/record/:datasetId/:labeler", IsAuthenticated, LabelController.sendLabelData),

  app.post("/invites", [IsAuthenticated, InviteControllerPolicy.create], InviteController.create),
  app.get("/invites/sent/:datasetId", IsAuthenticated, InviteController.showSent),
  app.get("/invites/received/:receiver", IsAuthenticated, InviteController.showReceived),
  app.delete("/invite/:datasetId/:receiver", IsAuthenticated, InviteController.delete),
  app.post("/invite/:datasetId", IsAuthenticated, InviteController.handleResponse)
};