import { useState } from "react";
import View from "@/view/View";
import UserService from "./UserService";

function Users () {
  const [search, setSearch] = useState("");

  const handleLoad = (users) => {
    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>用户名</th>
              <th>积分</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <a className="text-decoration-none" href={`/user/${user.name}`}>{user.name}</a>
                </td>
                <td>{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header text-center bg-success text-white">积分排行榜</div>
        <div className="card-body">
          <form onSubmit={(e) => {e.preventDefault(); setSearch(e.target.search.value);}}>
            <div className="input-group input-group-sm mb-3">
              <input className="form-control" id="search" placeholder="搜索用户名" />
              <button className="btn btn-primary" type="submit">搜索</button>
            </div>
          </form>
          <View service={UserService.getAll} params={[search]} handleLoad={handleLoad} checkLogin={false} />
        </div>
      </div>
    </>
  );
}

export default Users;