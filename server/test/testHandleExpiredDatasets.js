const handleExpiredDatasets = require("../src/utils/handleExpiredDatasets");

const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 800).toISOString().split("T")[0];
console.log(date);
handleExpiredDatasets(date);