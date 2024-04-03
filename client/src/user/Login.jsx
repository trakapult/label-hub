import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import UserForm from "./UserForm";
import AuthService from "./AuthService";

function Login() {
  const navigate = useNavigate();
  const {state, dispatch} = useAuthContext();
  const [error, setError] = useState("");

  const login = async (e) => {
    try {
      const email = e.target.email.value, password = e.target.password.value;
      const res = await AuthService.login({email, password});
      if (res.error) {
        setError(res.error);
        return;
      }
      dispatch({type: "LOGIN", token: res.data.token, user: res.data.user});
      navigate("/");
    } catch (err) {
      setError(err.response.data.error);
    }
  }

  if (state.isLoggedIn) {
    navigate("/");
    return null;
  }

  return (
    <div className="container pt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <UserForm
            title="登录"
            attrs={[
              {type: "email", label: "邮箱"},
              {type: "password", label: "密码"}
            ]}
            error={error}
            buttonName={"登录"}
            handleSubmit={login}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;