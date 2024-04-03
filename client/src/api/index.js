import axios from "axios";

export default (token) => {
  return axios.create({
    baseURL: "http://localhost:5174",
    headers: token === null ? null : {Authorization: `Bearer ${token}`}
  });
};