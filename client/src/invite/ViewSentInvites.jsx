import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import InviteService from "./InviteService";

function ViewSentInvites ({datasetId}) {
  const {state} = useAuthContext();
  const [invites, setInvites] = useState(null);

  const get = async () => {
    try {
      const res = await InviteService.getSent(state.token, datasetId);
      setInvites(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response.data.error);
    }
  }

  useEffect(() => {
    if (state.isLoggedIn) {
      get();
    }
  }, [state, datasetId]);

  const handleDelete = async (e) => {
    try {
      const receiver = e.target.id;
      const res = await InviteService.delete(state.token, datasetId, receiver);
      setInvites(invites.filter((invite) => invite.receiver !== receiver));
      console.log(res.data);
    } catch(err) {
      console.error(err);
      alert(err.response.data.error);
    }
  };
  return (
    <>
      {invites && invites.length === 0 && <div>暂无邀请</div>}
      {invites && invites.length > 0 &&
        <table className="table table-striped border text-center">
          <thead>
            <tr>
              <th>接收者</th>
              <th>奖金</th>
              <th>罚金</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.receiver}>
                <td>{invite.receiver}</td>
                <td>{invite.reward}</td>
                <td>{invite.penalty}</td>
                <td>{invite.status}</td>
                <td>
                  <div
                    className="btn btn-primary"
                    type="button"
                    id={invite.receiver}
                    onClick={handleDelete}
                  >
                    撤回
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </>
  );
}

export default ViewSentInvites;