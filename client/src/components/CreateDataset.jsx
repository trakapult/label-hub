import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import DatasetService from "../services/DatasetService";
import "./CreateDataset.module.css";

function CreateDataset() {
  const navigate = useNavigate();
  const {state, dispatch} = useAuthContext();
  const [error, setError] = useState("");

  const submit = async (e) => {
    try {
      const userId = state.user.id;
      const name = e.target.name.value, description = e.target.description.value;
      const dataType = e.target.dataType.value, labelType = e.target.labelType.value;
      const segment = e.target.segment.checked;
      const file = e.target.samples.files[0];
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("dataType", dataType);
      formData.append("labelType", labelType);
      formData.append("segment", segment);
      formData.append("file", file);
      const res = await DatasetService.post(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
    } catch (err) {
      console.log(err);
      setError(err.response.data.error);
    }
  }
  
  return (
    <div className="container pt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card pt-4 pb-4">
            <form className="card-body" onSubmit={(e) => {e.preventDefault(); submit(e);}}>
              <h2 className="card-title mb-4">创建数据集</h2>
              <div className="input-group mb-3">
                <span className="input-group-text">名称</span>
                <input className="form-control" id="name" required />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">描述</span>
                <textarea className="form-control" id="description" required></textarea>
              </div>
              <div className="row align-items-center mb-3">
                <div className="col-md-4">
                  <select className="form-select" id="dataType" required>
                    <option value="">选择数据类型</option>
                    <option value="text">文本</option>
                    <option value="image">图像</option>
                    <option value="audio">音频</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select className="form-select" id="labelType" required>
                    <option value="">选择标注类型</option>
                    <option value="numerical">数值</option>
                    <option value="categorical">分类</option>
                    <option value="text">文本</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="segment" />
                    <label className="form-check-label" htmlFor="segment">分段标注</label>
                  </div>
                </div>
              </div>
              <div className="input-group">
                <span className="input-group-text">样本</span>
                <input className="form-control" type="file" id="samples" accept=".zip" required />
              </div>
              <div className="form-text text-center mb-3">请上传zip文件</div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="text-center">
                <button className="btn btn-primary" type="submit">创建</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDataset;