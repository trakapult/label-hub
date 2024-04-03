import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ViewUser from "./components/ViewUser";
import CreateDataset from "./components/CreateDataset";
import Datasets from "./components/Datasets";
import ViewDataset from "./components/ViewDataset";

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