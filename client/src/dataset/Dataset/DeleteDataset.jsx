import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import DatasetService from "../DatasetService";
import Error from "@/common/Error";

function DeleteDataset ({dataset}) {
  const navigate = useNavigate();
  const {state} = useAuthContext();
  const sameUser = state.user.name === dataset.admin;
  const [error, setError] = useState(sameUser ? "" : "您无权删除此数据集");
  const handleDelete = async (e) => {
    try {
      if (e.target.name.value !== dataset.name) {
        setError("数据集名称不匹配");
        return;
      }
      await DatasetService.delete(state.token, dataset.id);
      navigate(`/user/${state.user.name}`);
    } catch (err) {
      console.error(err);
      setError(err.response.data.error);
    }
  }

  return (
    <>
      {sameUser && (
        <form className="text-center mb-3" onSubmit={(e) => {e.preventDefault(); handleDelete(e);}}>
          <h5>请键入数据集名称并点击“确认删除”</h5>
          <input  className="form-control mt-3" type="text" id="name" placeholder={dataset.name} />
          <button className="btn btn-danger mt-3">确认删除</button>
          <div className="form-text text-center">删除后会清除标注与上传奖励</div>
        </form>
      )}
      {(!sameUser || error) && (
        <Error error={error} />
      )}
    </>
  );
}

export default DeleteDataset;