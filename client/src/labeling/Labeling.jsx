import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import View from '../view/View';
import Error from '../common/Error';
import DatasetService from '../dataset/DatasetService';
import LabelService from './LabelService';

const height = 300;

function Labeling () {
  const datasetId = useParams().datasetId;
  const navigate = useNavigate();
  const {state} = useAuthContext();
  const [error, setError] = useState("");
  const [sampleId, setSampleId] = useState(0);
  const [labels, setLabels] = useState({});
  const [curLabel, setCurLabel] = useState("");

  const saveLabel = (step, force = false) => (e) => {
    const oldLabel = labels[sampleId];
    const newLabel = e?.target.value || e?.target?.textualLabel?.value || oldLabel;
    console.log(oldLabel, newLabel);
    if (!newLabel && step === 1) return;
    let newLabels = labels;
    if (newLabel !== oldLabel) {
      newLabels = {...labels, [sampleId]: newLabel};
      setLabels(newLabels);
    }
    if (!oldLabel || force) {
      let nextSampleId = sampleId;
      if (step === -1 && !document.getElementById("prev").classList.contains("disabled"))
        nextSampleId--;
      if (step === 1 && !document.getElementById("next").classList.contains("disabled"))
        nextSampleId++;
      setSampleId(nextSampleId);
      setCurLabel(newLabels[nextSampleId] || "");
    } else {
      setCurLabel(newLabel);
    }
    console.log("newLabels", newLabels);
  }

  const upload = async () => {
    const res = await LabelService.create(state.token, datasetId, state.user.name, labels);
    if (res.error) {
      console.error(res.error);
      setError(res.error);
      return false;
    }
    setSampleId(0);
    setLabels({});
    setCurLabel("");
    navigate(`/dataset/${datasetId}`);
    return true;
  }

  useEffect(() => {
    if (!state.isLoggedIn) return;
    const loadLabels = async () => {
      const res = await LabelService.get(state.token, datasetId, state.user.name);
      if (res.error) {
        setError(res.error);
        return;
      }
      const {label, data} = res.data;
      if (label) {
        setLabels(data);
        setCurLabel(data[sampleId] || "");
      }
    }
    loadLabels();
  }, [state, datasetId]);

  useEffect(() => {
    const handleKey = (e) => {
      if (document.activeElement.id === "textualLabel") {
        if (e.key === "Enter" && e.ctrlKey)
          saveLabel(1, true)(e);
        return;
      }
      if (e.key >= "0" && e.key <= "9") {
        const button = document.getElementById(`button${e.key}`);
        if (button) {
          button.click();
          return;
        }
      }
      if (e.key === "ArrowLeft") {
        const button = document.getElementById("prev");
        if (button && !button.classList.contains("disabled")) {
          button.click();
          return;
        }
      }
      if (e.key === "ArrowRight") {
        const button = document.getElementById("next");
        if (button && !button.classList.contains("disabled")) {
          button.click();
          return;
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sampleId, labels]);

  useEffect(() => {
    const textualLabel = document.getElementById("textualLabel");
    if (textualLabel) {
      textualLabel.value = curLabel;
    }
  }, [sampleId, curLabel]);

  const handleDatasetLoad = (dataset) => {
    const {labelType, labelInfo} = dataset;

    const handleSampleLoad = ({file, info}) => {
      return (
        <>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="progress mb-3">
                <div
                  className="progress-bar"
                  style={{width: `${(sampleId + 1) / (info.maxSampleId + 1) * 100}%`}}
                >
                  {sampleId + 1}/{info.maxSampleId + 1}
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center mb-3">
            <div className="col-md-6 border rounded-end overflow-auto" style={{height: height}}>
              <div className="img-container">
                {dataset.dataType === "text" && <p>{file}</p>}
                {dataset.dataType === "image" && <img src={`data:image;base64,${btoa(file)}`} alt="sample" />}
                {dataset.dataType === "audio" && <audio src={`data:audio/mp3;base64,${btoa(file)}`} controls />}
              </div>
            </div>
          </div>
          <div className="row justify-content-center mb-3">
            {labelType === "numerical" && (
              <div className="text-center">
                <div
                  className="d-flex justify-content-center gap-2"
                  onClick={saveLabel(1)}
                >
                  {Array.from({length: labelInfo.max - labelInfo.min + 1}, (_, index) => (
                    <button
                      className={"btn rounded-circle " + (labelInfo.min + index === parseInt(curLabel) ? "btn-success" : "btn-primary")}
                      type="button"
                      value={labelInfo.min + index}
                      id={`button${labelInfo.min + index}`}
                      key={index}
                    >
                      {labelInfo.min + index}
                    </button>
                  ))}
                </div>
                <div className="form-text">可按单个数字键输入对应标签</div>
              </div>
            )}
            {labelType === "categorical" && (
              <div className="text-center">
                <div className="btn-group" onClick={saveLabel(1)}>
                  {labelInfo.map((label, index) => (
                    <button
                      className={"btn " + (label === curLabel ? "btn-success" : "btn-primary")}
                      type="button"
                      value={label}
                      id={`button${index + 1}`}
                      key={index}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="form-text">可按单个数字键i输入第i个标签</div>
              </div>
            )}
            {labelType === "textual" && (
              <form className="col-md-6 text-center" onSubmit={(e) => {e.preventDefault(); saveLabel(1, true)(e);}}>
                <textarea
                  className="form-control mb-2"
                  id="textualLabel"
                  placeholder="请输入文本"
                  required
                />
                <button className="btn btn-success" type="submit">保存</button>
                <div className="form-text">可按Ctrl+Enter保存</div>
              </form>
            )}
            <div className="d-flex justify-content-center gap-2 mt-2">
              <button
                className={"btn btn-primary" + (sampleId === 0 ? " disabled" : "")}
                type="button"
                id="prev"
                onClick={saveLabel(-1, true)}
              >
                上一个
              </button>
              <button className="btn btn-warning" type="button" onClick={upload}>上传进度</button>
              <button
                className={"btn btn-primary" + (sampleId === info.maxSampleId ? " disabled" : "")}
                type="button"
                id="next"
                onClick={saveLabel(1, true)}
              >
                下一个
              </button>
            </div>
            {error && <Error error={error} />}
          </div>
        </>
      );
    }

    return (
      <View service={DatasetService.getFile} params={[datasetId, sampleId]} handleLoad={handleSampleLoad} />
    );
  }

  return (
    <div className="container pt-3">
      <View service={DatasetService.get} params={[datasetId]} handleLoad={handleDatasetLoad} />
    </div>
  );
}

export default Labeling;