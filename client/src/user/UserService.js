import api from "@/api";

export default {
  getAll (token, search) {
    return api(token).get(`users?search=${search}`);
  },
  get (token, name) {
    return api(token).get("user/" + name);
  }
};