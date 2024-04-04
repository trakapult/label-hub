import api from "../api";

export default {
  create (token, dataset) {
    return api(token).post("datasets", dataset);
  },
  edit (token, datasetId, dataset) {
    return api(token).put(`dataset/${datasetId}`, dataset);
  },
  delete (token, datasetId) {
    return api(token).delete(`dataset/${datasetId}`);
  },
  getAll (token, search, selections) {
    const {admin, dataType, labelType, segments} = selections;
    return api(token).get(`datasets?search=${search}&admin=${admin}&dataType=${dataType}&labelType=${labelType}&segments=${segments}`);
  },
  get (token, datasetId) {
    return api(token).get(`dataset/${datasetId}`);
  },
  getFile (token, datasetId, sampleId) {
    return api(token).get(`file/${datasetId}/${sampleId}`);
  }
}