import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "./UserForm";
import { useAuthContext } from "../context/AuthContext";
import AuthService from "./AuthService";

function Register() {
  const navigate = useNavigate();
  const {state, dispatch} = useAuthContext();
  const [error, setError] = useState("");

  const register = async (e) => {
    try {
      const name = e.target.name.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      const res = await AuthService.register({name, email, password});
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
              {type: "name", label: "用户名", message: "用户名应为3-16个字符，且只能包含字母和数字"},
              {type: "email", label: "邮箱", message: "请输入有效的邮箱地址"},
              {type: "password", label: "密码", message: "密码应为8-32个字符，且只能包含字母和数字"}
            ]}
            error={error}
            buttonText={"注册"}
            handleSubmit={register}
          />
        </div>
      </div>
    </div>
  );
}

export default Register;