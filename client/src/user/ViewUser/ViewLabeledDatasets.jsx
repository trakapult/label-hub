import { useAuthContext } from "../../context/AuthContext";
import View from "../../view/View";
import LabelService from "../../labeling/LabelService";
import Icons from "../../dataset/Icons";

function ViewLabeledDatasets ({name}) {
  const {state} = useAuthContext();
  const sameUser = state.user.name === name;
  if (!sameUser) return null;
  const handleLoad = (datasets) => {
    return (
      <>
        <h4 className="card-subtitle mb-4">
          标注的数据集
        </h4>
        <div className="col-md-12 overflow-auto" style={{maxHeight: "500px"}}>
          <table className="table table-striped text-center">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>进度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(({dataset, labeledNum}) => (
                <tr key={dataset.id}>
                  <td>{dataset.name}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Icons dataType={dataset.dataType} labelType={dataset.labelType} segments={dataset.segments} />
                    </div>
                  </td>
                  <td>{labeledNum} / {dataset.sampleNum}</td>
                  <td>
                    <a className="btn btn-primary" href={`/labeling/${dataset.id}`}>继续标注</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <View service={LabelService.getDatasets} params={[name]} handleLoad={handleLoad} />
  );
}

export default ViewLabeledDatasets;