import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoPanel from "./InfoPanel";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "../services/AuthService";

function Register() {
  const navigate = useNavigate();
  const {state, dispatch} = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    try {
      const res = await AuthService.register({email, password});
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
            title="注册"
            attrs={[
              {type: "email", label: "邮箱", setter: setEmail},
              {type: "password", label: "密码", setter: setPassword, message: "密码应为8-32个字符，且只能包含字母和数字"}
            ]}
            error={error}
            buttonName={"注册"}
            handleSubmit={register}
          />
        </div>
      </div>
    </div>
  );
}

export default Register;