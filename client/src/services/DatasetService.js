import Api from "./Api";

export default {
  post (token, dataset) {
    return Api(token).post("datasets", dataset);
  },
  getAll (token) {
    return Api(token).get("datasets");
  },
  get (token, datasetId) {
    return Api(token).get("dataset/" + datasetId);
  }
}