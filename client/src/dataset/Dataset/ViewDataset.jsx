import { useParams, useNavigate } from "react-router-dom";
import View from "../../view/View";
import ViewDatasetPanel from "./ViewDatasetPanel";
import DatasetService from "../DatasetService";

function ViewDataset () {
  const datasetId = useParams().datasetId;
  const navigate = useNavigate();
  const handleClick = (dataset) => {
    navigate(`/labeling/${dataset.id}`);
  }
  const handleLoad = (dataset) => {
    return (
      dataset && <ViewDatasetPanel dataset={dataset} buttonText="开始标注" handleClick={handleClick} />
    );
  }

  return (
    <div className="container pt-5">
      <View service={DatasetService.get} params={[datasetId]} handleLoad={handleLoad} />
    </div>
  );
}

export default ViewDataset;