import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoPanel from "./InfoPanel";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "../services/AuthService";

function Login() {
  const navigate = useNavigate();
  const {state, dispatch} = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await AuthService.login({email, password});
      if (res.error) {
        setError(res.error);
        return;
      }
      dispatch({type: "LOGIN"});
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
          <InfoPanel
            title="登录"
            attrs={[
              {type: "email", label: "邮箱", setter: setEmail},
              {type: "password", label: "密码", setter: setPassword, message: "密码长度至少为8个字符"}
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