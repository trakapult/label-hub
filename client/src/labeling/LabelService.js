import api from '../api';

export default {
  get (token, datasetId, labeler) {
    return api(token).get(`/label/${datasetId}/${labeler}`);
  },
  create (token, datasetId, labeler, labels) {
    return api(token).post(`/label/${datasetId}/${labeler}`, {labels});
  }
};