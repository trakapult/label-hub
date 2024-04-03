import Api from "./Api";

export default {
  get (token, userName) {
    return Api(token).get("user/" + userName);
  }
};