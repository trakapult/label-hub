import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import Error from "@/common/Error";
import DatasetService from "../DatasetService";

function DatasetForm ({dataset}) {
  const {state} = useAuthContext();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [labelInfoInput, setLabelInfoInput] = useState(null);

  useEffect(() => {
    if (dataset) {
      document.getElementsByClassName("card-title")[0].textContent = "编辑数据集";
      document.getElementById("name").value = dataset.name;
      document.getElementById("description").value = dataset.description;
      document.getElementById("type").value = dataset.type;
      document.getElementById("dataType").value = dataset.dataType;
      document.getElementById("labelType").value = dataset.labelType;
      document.getElementById("segments").checked = dataset.segments;
      document.getElementsByClassName("form-text")[0].classList.remove("required");
      document.getElementsByClassName("form-text")[0].textContent = "若不修改样本，可不上传";
      document.getElementsByClassName("buttons")[0].innerHTML = `
        <button class="btn btn-primary" type="submit">保存</button>
        <a class="btn btn-primary" href="/dataset/${dataset.id}">取消</a>
        <div class="form-text text-center mb-3">修改信息后会清除原有标注与上传奖励</div>
      `;
      handleChange({target: {value: dataset.labelType}});
    }
  }, [dataset]);

  const handleChange = (e) => {
    const labelType = e.target.value;
    if (labelType === "categorical") {
      setLabelInfoInput(
        <div className="input-group">
          <input
            className="form-control"
            type="text"
            id="categories"
            placeholder="类别1,类别2,...,类别n"
            defaultValue={(dataset && dataset.labelType === "categorical") ? dataset.labelInfo.join(",") : ""}
            required
          />
        </div>
      );
    } else if (labelType === "numerical") {
      setLabelInfoInput(
        <div className="input-group">
          <input
            className="form-control"
            type="number"
            id="min"
            placeholder="最小值"
            defaultValue={(dataset && dataset.labelType === "numerical") ? dataset.labelInfo.min : ""}
            required
          />
          <input
            className="form-control"
            type="number" 
            id="max"
            placeholder="最大值"
            defaultValue={(dataset && dataset.labelType === "numerical") ? dataset.labelInfo.max : ""}
            required
          />
        </div>
      );
    } else {
      setLabelInfoInput(null);
    }
  }

  const submit = async (e) => {
    try {
      const name = e.target.name.value;
      const description = e.target.description.value;
      const admin = state.user.name;
      const type = e.target.type.value;
      const dataType = e.target.dataType.value;
      const labelType = e.target.labelType.value;
      const min = e.target?.min?.value, max = e.target?.max?.value;
      const categories = e.target?.categories?.value;
      let labelInfo = null;
      if (labelType === "numerical") {
        labelInfo = {min, max};
      } else if (labelType === "categorical") {
        labelInfo = categories.split(",");
      }
      const segments = e.target.segments.checked;
      const deadline = e.target.deadline.value;
      const file = e.target.samples.files[0];
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("admin", admin);
      formData.append("type", type);
      formData.append("dataType", dataType);
      formData.append("labelType", labelType);
      formData.append("labelInfo", JSON.stringify(labelInfo));
      formData.append("segments", segments);
      formData.append("deadline", deadline);
      if (file) formData.append("file", file);
      let res = null;
      if (dataset) {
        res = await DatasetService.edit(state.token, dataset.id, formData);
      } else {
        res = await DatasetService.create(state.token, formData);
      }
      navigate("/dataset/" + res.data.id);
    } catch (err) {
      console.error(err);
      setError(err.response.data.error);
    }
  }
  
  return (
    <div className="card pt-4 pb-4">
      <form className="card-body" onSubmit={(e) => {e.preventDefault(); submit(e);}}>
        <h2 className="card-title mb-4">创建数据集</h2>
        <div className="input-group mb-3">
          <span className="input-group-text">名称</span>
          <input className="form-control" id="name" required />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text">描述</span>
          <textarea className="form-control" id="description" required style={{height: "150px"}} />
        </div>
        <div className="row align-items-center mb-3">
          <div className="col-md-2">
            <select className="form-select" id="type" required>
              <option value="">(类型)</option>
              <option value="public">公开</option>
              <option value="private">私有</option>
              <option value="entertain">娱乐</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" id="dataType" required>
              <option value="">(数据)</option>
              <option value="text">文本</option>
              <option value="image">图像</option>
              <option value="audio">音频</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" id="labelType" required onChange={handleChange}>
              <option value="">(标注)</option>
              <option value="numerical">数值</option>
              <option value="categorical">分类</option>
              <option value="textual">文本</option>
            </select>
          </div>
          <div className="col-md-4">
            {labelInfoInput}
          </div>
          <div className="col-md-2">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="segments" />
              <label className="form-check-label" htmlFor="segments">分段</label>
            </div>
          </div>
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text">期限</span>
          <input className="form-control" type="date" id="deadline" defaultValue={
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          } required />
        </div>
        <div className="input-group">
          <span className="input-group-text">样本</span>
          <input className="form-control" type="file" id="samples" accept=".zip" />
        </div>
        <div className="form-text text-center mb-3">请上传zip文件</div>
        {error && <Error error={error} />}
        <div className="buttons text-center">
          <button className="btn btn-primary" type="submit">创建</button>
        </div>
      </form>
    </div>
  );
}

export default DatasetForm;