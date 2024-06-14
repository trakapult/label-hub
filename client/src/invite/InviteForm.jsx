import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import View from "@/view/View";
import UserService from "@/user/UserService";
import InviteService from "./InviteService";
import Error from "@/common/Error";

function InviteForm ({datasetId}) {
  const {state} = useAuthContext();
  const [search, setSearch] = useState("");
  const [receivers, setReceivers] = useState([]);
  const [error, setError] = useState("");
  
  const sendInvite = async (e) => {
    try {
      const reward = e.target.reward.value;
      const penalty = e.target.penalty.value;
      if (receivers.length === 0) {
        setError("请选择至少一个用户");
        return;
      }
      for (const receiver of receivers) {
        const invite = {datasetId, receiver, reward, penalty};
        const res = await InviteService.create(state.token, invite);
      }
      setError("");
      e.target.querySelector("button").classList.remove("btn-primary");
      e.target.querySelector("button").classList.add("btn-success");
      e.target.querySelector("button").disabled = true;
    } catch(err) {
      console.error(err);
      setError(err.response.data.error);
    }
  }
  const handleReceivers = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setReceivers([...receivers, value]);
    } else {
      setReceivers(receivers.filter((name) => name !== value));
    }
  };
  const handleUsersLoad = (users) => {
    return (
      <div className="text-center">
        <form onSubmit={(e) => {e.preventDefault(); setSearch(e.target.search.value);}}>
          <div className="input-group mb-3">
            <input className="form-control" id="search" placeholder="搜索用户" />
            <button className="btn btn-primary" type="submit">搜索</button>
          </div>
        </form>
        <div className="col-md-12 overflow-auto" style={{maxHeight: "200px"}}>
          <table className="table table-striped border text-center">
            <thead>
              <tr>
                <th>用户名</th>
                <th>邮箱</th>
                <th>积分</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.name}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.points}</td>
                  <td>
                    <div className="form-check" onChange={handleReceivers}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={user.name}
                        defaultChecked={receivers.includes(user.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-text mb-3">若需更新已发送的邀请，请先撤回原邀请</div>
        <form onSubmit={(e) => {e.preventDefault(); sendInvite(e);}}>
          <div className="input-group mb-3">
            <span className="input-group-text">奖金</span>
            <input className="form-control" type="number" id="reward" defaultValue={5} required />
            <span className="input-group-text">罚金</span>
            <input className="form-control" id="penalty" defaultValue={0} required />
          </div>
          <div className="form-text mb-3">接受邀请后，对于每个样本，在期限内正确标注将在原奖励基础上发放奖金，否则将扣除罚金</div>
          <button className="btn btn-primary mb-3" type="submit">发送邀请</button>
        </form>
        {error && <Error error={error} />}
      </div>
    );
  };
  return (
    <View service={UserService.getAll} params={[search]} handleLoad={handleUsersLoad} />
  );
}

export default InviteForm;