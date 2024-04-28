import api from "@/api";

export default {
  register (credentials) {
    return api(null).post("register", credentials);
  },
  login (credentials) {
    return api(null).post("login", credentials);
  }
}