import Api from "./Api";

export default {
  register (credentials) {
    return Api(null).post("register", credentials);
  },
  login (credentials) {
    return Api(null).post("login", credentials);
  }
}