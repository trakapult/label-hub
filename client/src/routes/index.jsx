import Home from "../home/Home";
import Login from "../user/Login";
import Register from "../user/Register";
import ViewUser from "../user/ViewUser";
import CreateDataset from "../dataset/CreateDataset";
import Datasets from "../dataset/Datasets";
import ViewDataset from "../dataset/ViewDataset";

const routes = [
  {path: "/", name: "Home", element: <Home />},
  {path: "/login", name: "Login", element: <Login />},
  {path: "/register", name: "Register", element: <Register />},
  {path: "/user/:userName", name: "User", element: <ViewUser />},
  {path: "/create", name: "CreateDataset", element: <CreateDataset />},
  {path: "/datasets", name: "Datasets", element: <Datasets />},
  {path: "/dataset/:datasetId", name: "Dataset", element: <ViewDataset />},
];

export default routes;