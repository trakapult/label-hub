import api from '@/api';

export default {
  create (token, datasetId, labeler, labelData) {
    return api(token).post("label", {datasetId, labeler, labelData});
  },
  get (token, datasetId, labeler) { // occupies paths like /label/datasets/... and label/labelers/...
    return api(token).get(`/label/${datasetId}/${labeler}`);
  },
  getDatasets (token, labeler) {
    return api(token).get(`/labeledDatasets/${labeler}`);
  },
  getLabelRecords (token, datasetId) {
    return api(token).get(`/labelRecords/${datasetId}`);
  },
  getLabelData (token, datasetId, labeler, nameAsKey = false) {
    return api(token).get(`/record/${datasetId}/${labeler}` + (nameAsKey ? "?nameAsKey=true" : ""));
  }
};