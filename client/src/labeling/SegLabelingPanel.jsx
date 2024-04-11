import NumericalLabels from "./Labels/NumericalLabels";
import CategoricalLabels from "./Labels/CategoricalLabels";
import TextualLabels from "./Labels/TextualLabels";

const height = 500;
const colors = ["blue", "coral", "green", "salmon", "seagreen", "steelblue"];
const hashMap = {}, hashMapLim = 20;

/*
function getHash(label) {
  if (!label) return 0;
  if (hashMap[label] === undefined) {
    let len = Object.keys(hashMap).length;
    if (len >= hashMapLim)
      return label.charCodeAt(label.length - 1) % (colors.length - 1) + 1;
    hashMap[label] = len;
  }
  return hashMap[label] % (colors.length - 1) + 1;
}

function getColor(label, light=false) {
  const hash = getHash(label);
  return (light ? "light" : "") + colors[hash];
}
*/

function getColor(index, light=false) {
  return (light ? "light" : "") + colors[index % colors.length];
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
              <th>序号</th>
              {attrs.map((attr, index) => <th key={index}>{attr}</th>)}
              <th>标签</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => row === null ? null : (
              <tr key={index}>
                {row.map((value, idx) => <td key={idx} style={{color: getColor(row[0] - 1)}}>{value}</td>)}
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