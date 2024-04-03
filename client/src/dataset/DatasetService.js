import api from "../api";

export default {
  post (token, dataset) {
    return api(token).post("datasets", dataset);
  },
  getAll (token, search, selections) {
    const {dataType, labelType, segments} = selections;
    return api(token).get(`datasets?search=${search}&dataType=${dataType}&labelType=${labelType}&segments=${segments}`);
  },
  get (token, datasetId) {
    return api(token).get(`dataset/${datasetId}`);
  },
  getFile (token, datasetId, sampleId) {
    return api(token).get(`file/${datasetId}/${sampleId}`);
  }
}