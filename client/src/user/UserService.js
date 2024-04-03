import api from "../api";

export default {
  get (token, userName) {
    return api(token).get("user/" + userName);
  }
};