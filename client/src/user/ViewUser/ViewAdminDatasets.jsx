import { useAuthContext } from "../../context/AuthContext";
import View from "../../view/View";
import DatasetService from "../../dataset/DatasetService";
import Icons from "../../dataset/Icons";

function ViewAdminDatasets ({name}) {
  const {state} = useAuthContext();
  const sameUser = state.user.name === name;
  const selections = {admin: name, dataType: "", labelType: "", segments: null};
  const handleLoad = (datasets) => {
    return (
      <>
        <h4 className="card-subtitle mb-4">
          管理的数据集
          {sameUser && (
            <a className="btn btn-primary float-end" href="/create">新建数据集</a>
          )}
        </h4>
        <div className="col-md-12 overflow-auto" style={{maxHeight: "500px"}}>
          <table className="table table-striped text-center">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr key={dataset.id}>
                  <td>{dataset.name}</td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <Icons dataType={dataset.dataType} labelType={dataset.labelType} segments={dataset.segments} />
                    </div>
                  </td>
                  <td>{new Date(dataset.createdAt).toLocaleString()}</td>
                  <td>
                    {sameUser && (
                      <div className="btn-group">
                        <a className="btn btn-primary" href={`/dataset/${dataset.id}`}>查看</a>
                        <a className="btn btn-primary" href={`/dataset/${dataset.id}/edit`}>编辑</a>
                        <a className="btn btn-primary" href={`/dataset/${dataset.id}/delete`}>删除</a>
                      </div>
                    )}
                    {!sameUser && (
                      <a className="btn btn-primary" href={`/dataset/${dataset.id}`}>查看</a>
                    )}
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
    <View service={DatasetService.getAll} params={["", selections]} handleLoad={handleLoad} />
  );
}

export default ViewAdminDatasets;