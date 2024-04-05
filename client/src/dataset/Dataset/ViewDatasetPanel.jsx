import View from "../../view/View";
import DatasetService from "../DatasetService";
import "./ViewDatasetPanel.css";

const height = 300;

function ViewDatasetPanel ({dataset, buttonText, handleClick}) {
  const dataTypes = [["text", "文本"], ["image", "图像"], ["audio", "音频"]];
  const labelTypes = [["numerical", "数值"], ["categorical", "分类"], ["textual", "文本"]];

  const handleLoad = ({file}) => {
    return (
      <div className="row justify-content-center">
          <div className="col-md-6 border rounded overflow-auto" style={{maxHeight: height}}>
            <div className="img-container">
              {dataset.dataType === "text" && <p>{file}</p>}
              {dataset.dataType === "image" && <img src={`data:image;base64,${btoa(file)}`} alt="sample" />}
              {dataset.dataType === "audio" && <audio src={`data:audio/mp3;base64,${btoa(file)}`} controls />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card pt-4 pb-4">
      <form className="card-body">
        <h2 className="card-title mb-3">{dataset.name}</h2>
        <div className="mb-3">
          管理员：
          <a className="badge bg-secondary mb-2 text-decoration-none" href={`/user/${dataset.admin}`}>
            @{dataset.admin}
          </a>
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text">描述</span>
          <textarea
            className="form-control"
            id="description"
            value={dataset.description}
            style={{height: "150px", resize: "none"}}
            readOnly
          />
        </div>
        <div className="row align-items-center mb-3">
          <div className="col-md-3">
            数据类型：
            <div className="btn-group">
              {dataTypes.map(([dataType, name], index) => ( // ( not {
                <button
                  className={"btn " + (dataType === dataset.dataType ? " btn-primary" : " btn-secondary")}
                  type="button"
                  value={dataType}
                  key={index}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-3">
            标注类型：
            <div className="btn-group">
              {labelTypes.map(([labelType, name], index) => (
                <button
                  className={"btn " + (labelType === dataset.labelType ? " btn-primary" : " btn-secondary")}
                  type="button"
                  value={labelType}
                  key={index}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-3">
            {dataset.labelType === "numerical" && (
              <div className="input-group">
                <span className="input-group-text">范围</span>
                <input className="form-control" type="number" id="min" value={dataset.labelInfo.min} readOnly />
                <input className="form-control" type="number" id="max" value={dataset.labelInfo.max} readOnly />
              </div>
            )}
            {dataset.labelType === "categorical" && (
              <>
                类别：
                <div className="btn-group btn-group-sm">
                  {dataset.labelInfo.map((label, index) => (
                    <button className="btn btn-primary" type="button" key={index}>{label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="segments" checked={dataset.segments} readOnly />
              <label className="form-check-label" htmlFor="segments">分段标注</label>
            </div>
          </div>
        </div>
        样本示例：
        <br />
        <View service={DatasetService.getFile} params={[dataset.id, 0]} handleLoad={handleLoad} />
        <div className="text-center mt-3">
          <button className="btn btn-primary" type="button" onClick={() => handleClick(dataset)}>{buttonText}</button>
        </div>
      </form>
    </div>
  );
}

export default ViewDatasetPanel;