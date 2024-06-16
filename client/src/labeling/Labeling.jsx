import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import View from "@/view/View";
import Error from "@/common/Error";
import Timer from "@/common/Timer";
import NoSegLabeling from "./NoSegLabeling";
import SegLabeling from "./SegLabeling";
import DatasetService from "@/dataset/DatasetService";
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
    const loadLabelData = async () => {
      let res = await LabelService.get(state.token, datasetId, state.user.name);
      const labeledNum = res.data.labeledNum;
      if (!labeledNum) return;
      res = await LabelService.getLabelData(state.token, datasetId, state.user.name);
      const labelData = res.data;
      setLabelData(labelData);
      setSampleId(labeledNum - 1);
      setCurLabelData(labelData[labeledNum - 1] || "");
    }
    loadLabelData();
  }, [state, datasetId]);

  useEffect(() => {
    const handleKey = (e) => {
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
    const graph = dataset?.settings?.graph;

    const moveTo = (next) => () => {
      if (0 <= next && next < dataset.sampleNum) {
        setSampleId(next);
        setCurLabelData(labelData[next] || "");
        return true;
      }
      return false;
    }
    const getNext = (label) => {
      let next = sampleId + 1;
      if (graph) {
        next = graph[sampleId]?.[label];
        if (next === undefined) next = graph[sampleId];
        if (next === undefined) next = sampleId;
      }
      return next;
    }

    const saveLabelData = (value) => {
      const oldLabel = labelData[sampleId];
      let newLabel = value || oldLabel;
      if (!newLabel) return;
      if (Array.isArray(newLabel)) {
        newLabel = newLabel.filter((s) => s.label !== "");
      }
      let newLabelData = labelData;
      if (newLabel !== oldLabel) {
        newLabelData = {...labelData, [sampleId]: newLabel};
        setLabelData(newLabelData);
      }
      if (autojump) {
        if (!moveTo(getNext(newLabel))())
          setCurLabelData(newLabel);
      } else {
        setCurLabelData(newLabel);
      }
    }
  
    const upload = async () => {
      try {
        const res = await LabelService.create(state.token, datasetId, state.user.name, labelData);
        setSampleId(0);
        setLabelData({});
        setCurLabelData("");
        navigate(`/user/${state.user.name}`);
        return true;
      } catch (err) {
        console.error(err);
        setError(err.response.data.error);
        return false;
      }
    }

    const handleSampleLoad = ({file, fileInfo}) => {
      return (
        <>
          {!segments && <NoSegLabeling
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
            {dataset?.settings?.time &&
              <Timer minutes={dataset.settings.time} navigateTo={`/dataset/${datasetId}`} />
            }
            {!dataset?.settings?.graph &&
              <div className="progress mb-3">
                <div
                  className="progress-bar bg-success"
                  style={{width: `${(sampleId + 1) / dataset.sampleNum * 100}%`}}
                >
                  {sampleId + 1}/{dataset.sampleNum}
                </div>
              </div>
            }
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
            className={"btn btn-primary" + (sampleId === 0 || dataset?.settings?.graph ? " disabled" : "")}
            type="button"
            id="prev"
            onClick={moveTo(sampleId - 1)}
          >
            上一个
          </button>
          <button className="btn btn-warning" type="button" onClick={upload}>上传进度</button>
          <button
            className={"btn btn-primary" + (!curLabelData || sampleId === dataset.sampleNum - 1 ? " disabled" : "")}
            type="button"
            id="next"
            onClick={moveTo(getNext(curLabelData))}
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