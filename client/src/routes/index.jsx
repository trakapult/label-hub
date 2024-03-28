import Home from "../components/Home";
import Login from "../components/Login";
import Register from "../components/Register";

const routes = [
  {
    path: "/",
    name: "Home",
    element: <Home />
  },
  {
    path: "/login",
    name: "Login",
    element: <Login />
  },
  {
    path: "/register",
    name: "Register",
    element: <Register />
  }
];

export default routes;