import { useAuthContext } from "@/context/AuthContext";
import View from "@/view/View";
import DatasetService from "@/dataset/DatasetService";
import Icons from "@/dataset/Icons";

function ViewAdminDatasets ({name}) {
  const {state} = useAuthContext();
  const sameUser = state.user.name === name;
  const handleLoad = (datasets) => {
    return (
      <>
        <h4 className="card-subtitle mb-4">
          管理的数据集
          {sameUser && (
            <div className="d-flex float-end gap-2">
              <a className="btn btn-primary" href="/create">新建数据集</a>
            </div>
          )}
        </h4>
        <div className="col-md-12 overflow-auto" style={{maxHeight: "500px"}}>
          <table className="table table-striped text-center">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr key={dataset.id}>
                  <td>{dataset.name}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Icons type={dataset.type} dataType={dataset.dataType} labelType={dataset.labelType} segments={dataset.segments} />
                    </div>
                  </td>
                  <td>{new Date(dataset.createdAt).toLocaleString()}</td>
                  <td>
                    <a className="btn btn-primary" href={`/dataset/${dataset.id}`}>查看</a>
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
    <View
      service={DatasetService.getAll}
      params={["", {admin: name, type: "", dataType: "", labelType: "", segments: null}]}
      handleLoad={handleLoad}
      checkLogin={false}
    />
  );
}

export default ViewAdminDatasets;