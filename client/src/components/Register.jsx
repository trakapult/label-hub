import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "./UserForm";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "../services/AuthService";

function Register() {
  const navigate = useNavigate();
  const {state, dispatch} = useAuthContext();
  const [error, setError] = useState("");

  const register = async (e) => {
    try {
      const email = e.target.email.value, password = e.target.password.value;
      const res = await AuthService.register({email, password});
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
            title="注册"
            attrs={[
              {type: "email", label: "邮箱"},
              {type: "password", label: "密码", message: "密码应为8-32个字符，且只能包含字母和数字"}
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