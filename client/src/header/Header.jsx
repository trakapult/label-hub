import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import ViewReceivedInvites from "@/invite/ViewReceivedInvites";
import Popup from "@/common/Popup";

function Header() {
  const {state, dispatch} = useAuthContext();
  const [viewInvites, setViewInvites] = useState(false);
  const toggleInvites = () => setViewInvites(!viewInvites);
  return (
    <>
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
        <div className="container-fluid">
          <div className="navbar-nav">
            <a className="nav-link active" href="/">LabelHub</a>
            <a className="nav-link" href="/create">创建数据集</a>
          </div>
          {!state.isLoggedIn && (
            <div className="navbar-nav">
              <a className="nav-link" href="/login">登录</a>
              <a className="nav-link" href="/register">注册</a>
            </div>
          )}
          {state.isLoggedIn && (
            <div className="navbar-nav">
              <a className="nav-link" href={`/user/${state.user.name}`}>{state.user.name}</a>
              <button className="nav-link" onClick={toggleInvites}>邀请箱</button>
              <a className="nav-link" href="/" onClick={() => dispatch({type: "LOGOUT"})}>注销</a>
            </div>
          )}
        </div>
      </nav>
      {viewInvites && (
        <Popup onClose={toggleInvites}>
          <ViewReceivedInvites />
        </Popup>
      )}
    </>
  );
}

export default Header;