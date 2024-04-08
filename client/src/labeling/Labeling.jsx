import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import View from "../view/View";
import Error from "../common/Error";
import LabelingPanel from "./LabelingPanel";
import SegLabeling from "./SegLabeling";
import DatasetService from "../dataset/DatasetService";
import LabelService from "./LabelService";
import "./Labeling.css";

function Labeling () {
  const datasetId = useParams().datasetId;
  const navigate = useNavigate();
  const {state} = useAuthContext();
  const [error, setError] = useState("");
  const [sampleId, setSampleId] = useState(0);
  const [labelData, setLabelData] = useState({});
  const [curLabelData, setCurLabelData] = useState("");
  const [autojump, setAutojump] = useState(true);

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
        setLabelData(data);
        console.log("data", data, data[sampleId]);
        setCurLabelData(data[sampleId] || "");
      }
    }
    loadLabels();
  }, [state, datasetId]);

  /*useEffect(() => {
    const textualLabel = document.getElementById("textualLabel");
    if (textualLabel)
      textualLabel.value = curLabelData;
  }, [sampleId, curLabelData]);*/

  useEffect(() => {
    const handleKey = (e) => {
      // if focus on input, ignore key event
      if (document.activeElement.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        const button = document.getElementById("prev");
        if (button && !button.classList.contains("disabled"))
          button.click();
      } else if (e.key === "ArrowRight") {
        const button = document.getElementById("next");
        if (button && !button.classList.contains("disabled"))
          button.click();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sampleId, labelData]);

  const handleDatasetLoad = (dataset) => {
    const {labelType, labelInfo, segments} = dataset;

    const move = (step) => () => {
      const nextSampleId = sampleId + step;
      if (0 <= nextSampleId && nextSampleId < dataset.sampleNum) {
        setSampleId(nextSampleId);
        console.log("nextSampleId", nextSampleId, (labelData[nextSampleId] || ""));
        setCurLabelData(labelData[nextSampleId] || "");
        return true;
      }
      return false;
    }

    const saveLabelData = (value) => {
      console.log("saveLabelData", value);
      const oldLabel = labelData[sampleId];
      const newLabel = value || oldLabel;
      console.log(oldLabel, newLabel);
      if (!newLabel) return;
      let newLabelData = labelData;
      if (newLabel !== oldLabel) {
        newLabelData = {...labelData, [sampleId]: newLabel};
        setLabelData(newLabelData);
      }
      console.log("newLabelData", JSON.stringify(newLabelData));
      if (autojump) {
        if (!move(1)())
          setCurLabelData(newLabel);
      } else {
        setCurLabelData(newLabel);
      }
    }
  
    const upload = async () => {
      const res = await LabelService.create(state.token, datasetId, state.user.name, labelData);
      if (res.error) {
        console.error(res.error);
        setError(res.error);
        return false;
      }
      setSampleId(0);
      setLabelData({});
      setCurLabelData("");
      navigate(`/dataset/${datasetId}`);
      return true;
    }

    const handleSampleLoad = ({file, fileInfo}) => {
      return (
        <>
          {!segments && <LabelingPanel
            sampleId={sampleId}
            file={file}
            dataType={dataset.dataType}
            labelType={labelType}
            labelInfo={labelInfo}
            curLabel={curLabelData}
            saveLabel={saveLabelData}
          />}
          {segments && <SegLabeling
            sampleId={sampleId}
            file={file}
            fileInfo={fileInfo}
            dataType={dataset.dataType}
            labelType={labelType}
            labelInfo={labelInfo}
            curLabelData={curLabelData}
            saveLabelData={saveLabelData}
          />}
        </>
      );
    }

    return (
      <>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="progress mb-3">
              <div
                className="progress-bar"
                style={{width: `${(sampleId + 1) / dataset.sampleNum * 100}%`}}
              >
                {sampleId + 1}/{dataset.sampleNum}
              </div>
            </div>
          </div>
        </div>
        <View service={DatasetService.getFile} params={[datasetId, sampleId]} handleLoad={handleSampleLoad} />
        <div className="d-flex justify-content-center mt-2">
          <div className="form-check form-switch" onChange={(e) => setAutojump(e.target.checked)}>
            <input className="form-check-input" type="checkbox" id="autojump" defaultChecked={autojump} />
            <label className="form-check-label" htmlFor="autojump">自动跳转</label>
          </div>
        </div>
        <div className="d-flex justify-content-center gap-2 mt-2">
          <button
            className={"btn btn-primary" + (sampleId === 0 ? " disabled" : "")}
            type="button"
            id="prev"
            onClick={move(-1)}
          >
            上一个
          </button>
          <button className="btn btn-warning" type="button" onClick={upload}>上传进度</button>
          <button
            className={"btn btn-primary" + (!curLabelData || sampleId === dataset.sampleNum - 1 ? " disabled" : "")}
            type="button"
            id="next"
            onClick={move(1)}
          >
            下一个
          </button>
        </div>
        {error && 
          <div className="row justify-content-center mt-2">
            <div className="col-md-6">
              <Error error={error} />
            </div>
          </div>
        }
      </>
    );
  }

  return (
    <div className="container pt-3">
      <View service={DatasetService.get} params={[datasetId]} handleLoad={handleDatasetLoad} />
    </div>
  );
}

export default Labeling;