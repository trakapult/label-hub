import View from "../view/View";
import DatasetService from "./DatasetService";
import "./DatasetPanel.css";
import sample from "../assets/icons/original/label_textual.png";

const height = "200px";

function DatasetPanel ({dataset}) {
  const dataTypes = [["text", "文本"], ["image", "图像"], ["audio", "音频"]];
  const labelTypes = [["numerical", "数值"], ["categorical", "分类"], ["textual", "文本"]];

  const handleLoad = (file) => {
    const url = btoa(file);
    return (
      //<img src={`data:image;base64,${url}`} alt="sample" />
      <img src={sample} alt="sample" />
    );
  }

  return (
    <div className="card pt-4 pb-4">
      <form className="card-body">
        <h2 className="card-title mb-3">{dataset.name}</h2>
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
          <div className="col-md-4">
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
          <div className="col-md-4">
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
          <div className="col-md-4">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="segments" checked={dataset.segments} readOnly />
              <label className="form-check-label" htmlFor="segments">分段标注</label>
            </div>
          </div>
        </div>
        样本示例：
        <br />
        <div className="row justify-content-center">
          <div className="col-md-6 border rounded overflow-auto" style={{height: height}}>
            <div className="img-container">
              <View service={DatasetService.getFile} params={[dataset.id, 0]} handleLoad={handleLoad} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default DatasetPanel;