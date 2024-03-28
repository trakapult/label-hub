const path = require("path");
const projectName = "label-hub"

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
  }
};