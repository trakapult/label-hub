const colors = ["blue", "coral", "green", "gray", "salmon", "skyblue"];

function toColor(idx, light=false) {
  if (idx === -1)
    return "white";
  return (light ? "light" : "") + colors[idx % colors.length];
}

function LabelingPanel({dataType, data, attrs, rows, labels, handleLabelChange, height="500px"}) {
  return (
    <div className="container">
      <div className="row">
        <div
          className={"col-md-6 border rounded-start overflow-auto" + (dataType !== "text" ? " align-content-center" : "")}
          style={{height: height}}
        >
          {data}
        </div>
        <div className="col-md-6 border rounded-end overflow-auto" style={{height: height}}>
          <table className="table table-striped">
            <thead>
              <tr>
                {attrs.map((attr, index) => <th key={index}>{attr}</th>)}
                <th>标签</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) =>
                row === null ? null : (
                  <tr key={index}>
                    {row.map((value, index) => <td key={index}>{value}</td>)}
                    <td>
                      <div className="btn-group btn-group-sm" defaultValue={0} onClick={(e) => {
                        e.target.parentElement.childNodes.forEach((button) => {
                          button.classList.remove("active");
                        });
                        e.target.classList.add("active");
                        handleLabelChange(index, e)
                      }}>
                        {labels.map((label, index) =>
                          <button
                            className={"btn btn-primary" + (dataType !== "text" && index === 0 ? " active" : "")}
                            value={index}
                            key={index}>
                            {label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LabelingPanel;
export { toColor };