import { useAuthContext } from "../../context/AuthContext";
import { useParams } from 'react-router-dom';
import View from "../../view/View";
import EditDatasetPanel from "./EditDatasetPanel";
import Error from "../../common/Error";
import DatasetService from "../DatasetService";

function EditDataset () {
  const {state} = useAuthContext();
  const datasetId = useParams().datasetId;
  const handleLoad = (dataset) => {
    const error = state.user.name === dataset.admin ? "" : "您无权编辑此数据集";
    return (
      <div className="container pt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {error && <Error error={error} />}
            {!error && <EditDatasetPanel dataset={dataset} />}
          </div>
        </div>
      </div>
    );
  }
  return (
    <View service={DatasetService.get} params={[datasetId]} handleLoad={handleLoad} />
  );
}

export default EditDataset;