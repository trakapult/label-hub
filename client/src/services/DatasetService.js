import Api from "./Api";

export default {
  post (token, dataset) {
    return Api(token).post("datasets", dataset);
  },
  getAll (token, search, selections) {
    const {dataType, labelType, segments} = selections;
    return Api(token).get(`datasets?search=${search}&dataType=${dataType}&labelType=${labelType}&segments=${segments}`);
  },
  get (token, datasetId) {
    return Api(token).get("dataset/" + datasetId);
  }
}