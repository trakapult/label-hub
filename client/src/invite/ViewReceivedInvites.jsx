import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import InviteService from "./InviteService";

function ViewReceivedInvites () {
  const {state} = useAuthContext();
  const [invites, setInvites] = useState(null);

  const get = async () => {
    try {
      const res = await InviteService.getReceived(state.token, state.user.name);
      setInvites(res.data);
    } catch (err) {
      console.log(err);
      alert(err.response.data.error);
    }
  }

  useEffect(() => {
    if (state.isLoggedIn) {
      get();
    }
  }, [state]);

  const handleResponse = async (datasetId, response) => {
    try {
      const res = await InviteService.respond(state.token, datasetId, response);
      console.log(res.data);
      const status = response === "accept" ? "已接受" : response === "reject" ? "已拒绝" : "等待回复";
      setInvites(invites.map((invite) => invite.datasetId === datasetId ? {...invite, status} : invite));
    } catch(err) {
      console.log(err);
      alert(err.response.data.error);
    }
  }
  return (
    <>
      {invites && invites.length === 0 && <div>暂无邀请</div>}
      {invites && invites.length > 0 && (
        <table className="table table-striped border text-center">
          <thead>
            <tr>
              <th>发送者</th>
              <th>奖金</th>
              <th>罚金</th>
              <th>截止日期</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.dataset.admin}>
                <td>{invite.dataset.admin}</td>
                <td>{invite.reward}</td>
                <td>{invite.penalty}</td>
                <td>{new Date(invite.deadline).toLocaleString()}</td>
                {invite.status === "等待回复" && (
                  <td>
                    <div className="btn-group">
                      <div className="btn btn-success"
                        type="button"
                        onClick={() => handleResponse(invite.datasetId, "accept")}
                      >
                        接受
                      </div>
                      <div
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleResponse(invite.datasetId, "reject")}
                      >
                        拒绝
                      </div>
                    </div>
                  </td>
                )}
                {invite.status !== "等待回复" && <td>{invite.status}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default ViewReceivedInvites;