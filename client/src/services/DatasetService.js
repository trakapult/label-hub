import Api from "./Api";

export default {
  post (dataset) {
    return Api().post("datasets", dataset);
  },
  getAll () {
    return Api().get("datasets");
  },
  get (datasetId) {
    return Api().get("datasets/" + datasetId);
  }
}