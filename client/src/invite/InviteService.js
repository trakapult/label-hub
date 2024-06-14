import api from "@/api";

export default {
  create (token, invite) {
    return api(token).post("/invites", invite);
  },
  getSent (token, datasetId) {
    return api(token).get(`/invites/sent/${datasetId}`);
  },
  getReceived (token, receiver) {
    return api(token).get(`/invites/received/${receiver}`);
  },
  delete (token, datasetId, receiver) {
    return api(token).delete(`/invite/${datasetId}/${receiver}`);
  },
  respond (token, datasetId, response) {
    return api(token).post(`/invite/${datasetId}`, {response});
  }
};