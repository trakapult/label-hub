import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import View from "../../view/View";
import ViewDatasetPanel from "./ViewDatasetPanel";
import Error from "../../common/Error";
import DatasetService from "../DatasetService";

function DeleteDataset () {
  const datasetId = useParams().datasetId;
  const navigate = useNavigate();
  const {state} = useAuthContext();
  const handleLoad = (dataset) => {
    const error = state.user.name === dataset.admin ? "" : "您无权删除此数据集";
    const handleClick = async (dataset) => {
      try {
        const res = await DatasetService.delete(state.token, dataset.id);
        if (res.error) {
          return;
        }
        navigate(`/user/${state.user.name}`);
      } catch (err) {
        console.log(err);
      }
    }
    
    return (
      <>
        {error && <Error error={error} />}
        {dataset && !error && <ViewDatasetPanel dataset={dataset} buttonText="确认删除" handleClick={handleClick} />}
      </>
    );
  }

  return (
    <div className="container pt-5">
      <View service={DatasetService.get} params={[datasetId]} handleLoad={handleLoad} />
    </div>
  );
}

export default DeleteDataset;