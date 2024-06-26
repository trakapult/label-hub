import Home from "@/home/Home";

import Login from "@/user/Login";
import Register from "@/user/Register";
import ViewUser from "@/user/ViewUser";

import CreateDataset from "@/dataset/Dataset/CreateDataset";
import EditDataset from "@/dataset/Dataset/EditDataset";
import ViewDataset from "@/dataset/Dataset/ViewDataset";

import Labeling from "@/labeling/Labeling";

const routes = [
  {path: "/", name: "Home", element: <Home />},

  {path: "/login", name: "Login", element: <Login />},
  {path: "/register", name: "Register", element: <Register />},
  {path: "/user/:name", name: "ViewUser", element: <ViewUser />},

  {path: "/create", name: "CreateDataset", element: <CreateDataset />},
  {path: "/dataset/:datasetId/edit", name: "EditDataset", element: <EditDataset />},
  {path: "/dataset/:datasetId", name: "ViewDataset", element: <ViewDataset />},

  {path: "/labeling/:datasetId", name: "Labeling", element: <Labeling />}
];

export default routes;