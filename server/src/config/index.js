const path = require("path");
const projectName = "label-hub";

module.exports = {
  port: process.env.PORT || 5174,
  db: {
    database: process.env.DB_NAME || projectName,
    user: process.env.DB_USER || projectName,
    password: process.env.DB_PASS || projectName,
    options: {
      dialect: process.env.DIALECT || "sqlite",
      host: process.env.HOST || "localhost",
      storage: path.resolve(__dirname, `../../${projectName}.sqlite`),
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "secret"
  },
  user: {
    showLimit: 100,
  },
  dataset: {
    showLimit: 100,
    imageMaxSize: 500 * 500,
  },
  rewardSystem: {
    initialPoints: 1000,
    uploadReward: {
      "public": 20,
      "private": 0,
      "entertain": 5,
    },
    noSegmentsPay: 1,
    segmentsPay: 2,
    correctPay: 2,
    accRatio: 0.999,
    threshold: 0.05,
  }
};