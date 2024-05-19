function DatasetsSearchPanel ({handleSearch, handleSelection}) {
  return (
    <>
      <div className="row align-items-center mb-3">
        <form onSubmit={(e) => {e.preventDefault(); handleSearch(e);}}>
          <div className="input-group input-group">
            <span className="input-group-text">搜索</span>
            <input className="form-control" id="search" placeholder="数据集名称，描述，发布者" />
            <button className="btn btn-primary" type="submit">搜索</button>
          </div>
        </form>
      </div>
      <div className="row align-items-center mb-4" onChange={handleSelection}>
        <div className="col-md-3">
          <select className="form-select" id="type">
            <option value="">选择数据集类型</option>
            <option value="public">公开</option>
            <option value="private">私有</option>
            <option value="entertain">娱乐</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" id="dataType">
            <option value="">选择数据类型</option>
            <option value="text">文本</option>
            <option value="image">图像</option>
            <option value="audio">音频</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" id="labelType">
            <option value="">选择标注类型</option>
            <option value="numerical">数值</option>
            <option value="categorical">分类</option>
            <option value="textual">文本</option>
          </select>
        </div>
        <div className="col-md-3">
        <select className="form-select" id="segments">
            <option value="">选择是否分段标注</option>
            <option value="yes">是</option>
            <option value="no">否</option>
          </select>
        </div>
      </div>
    </>
  );
}

export default DatasetsSearchPanel;