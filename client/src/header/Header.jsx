import { useAuthContext } from "../context/AuthContext";

function Header() {
  const {state, dispatch} = useAuthContext();
  return (
    <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
      <div className="container-fluid">
        <div className="navbar-nav">
            <a className="nav-link active" href="/">LabelHub</a>
        </div>
        {!state.isLoggedIn && (
          <div className="navbar-nav">
            <a className="nav-link" href="/login">登录</a>
            <a className="nav-link" href="/register">注册</a>
          </div>
        )}
        {state.isLoggedIn && (
          <div className="navbar-nav">
            <a className="nav-link" href={`/user/${state.user.name}`}>个人信息</a>
            <a className="nav-link" href="/" onClick={() => dispatch({type: "LOGOUT"})}>注销</a>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;