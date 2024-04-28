import { useAuthContext } from "@/context/AuthContext";
import View from "@/view/View";
import LabelService from "@/labeling/LabelService";
import Icons from "@/dataset/Icons";

function ViewLabeledDatasets ({name}) {
  const {state} = useAuthContext();
  const sameUser = state.user.name === name;
  if (!sameUser) return null;
  const handleLoad = (labels) => {
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
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => (
                <tr key={label.dataset.id}>
                  <td>{label.dataset.name}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Icons
                        dataType={label.dataset.dataType}
                        labelType={label.dataset.labelType}
                        segments={label.dataset.segments}
                        publicized={label.dataset.publicized}
                      />
                    </div>
                  </td>
                  <td>{label.labeledNum} / {label.dataset.sampleNum}</td>
                  <td>
                    <a className="btn btn-primary" href={`/dataset/${label.dataset.id}`}>查看</a>
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