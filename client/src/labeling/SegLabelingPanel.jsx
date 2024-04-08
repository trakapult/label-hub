import NumericalLabels from "./Labels/NumericalLabels";
import CategoricalLabels from "./Labels/CategoricalLabels";
import TextualLabels from "./Labels/TextualLabels";

const height = 500;
const colors = ["blue", "coral", "green", "gray", "salmon", "skyblue"];

function getColor(idx, light=false) {
  if (idx === -1) return "white";
  return (light ? "light" : "") + colors[idx % colors.length];
}

function LabelingPanel({data, attrs, rows, labelType, labelInfo, saveLabel, curLabelData}) {
  const getLabels = (index) => {
    if (labelType === "numerical") {
      return (
        <NumericalLabels
          labelInfo={labelInfo}
          curLabel={curLabelData[index].label}
          saveLabel={saveLabel(index)}
          formtext={false}
        />
      );
    } else if (labelType === "categorical") {
      return (
        <CategoricalLabels
          labelInfo={labelInfo}
          curLabel={curLabelData[index].label}
          saveLabel={saveLabel(index)}
          formtext={false}
        />
      );
    } else if (labelType === "textual") {
      console.log("textual", curLabelData[index].label, typeof curLabelData[index].label);  
      return (
        <TextualLabels
          index={index}
          curLabel={curLabelData[index].label}
          saveLabel={saveLabel(index)}
        />
      );
    }
  }

  return (
    <div className="row mb-2">
      <div className="col-md-6 border rounded-start overflow-auto" style={{maxHeight: height}}>
        <div className="img-container">
          {data}
        </div>
      </div>
      <div className="col-md-6 border rounded-end overflow-auto" style={{maxHeight: height}}>
        <table className="table table-striped text-center">
          <thead>
            <tr>
              {attrs.map((attr, index) => <th key={index}>{attr}</th>)}
              <th>标签</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => row === null ? null : (
              <tr key={index}>
                {row.map((value, index) => <td key={index}>{value}</td>)}
                <td>{getLabels(index)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LabelingPanel;
export { getColor };