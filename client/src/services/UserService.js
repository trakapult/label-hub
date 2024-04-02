import Api from "./Api";

export default {
  get (token, userId) {
    return Api(token).get("user/" + userId);
  }
};