import View from "../view/View";
import DatasetPanel from "./DatasetPanel";
import DatasetService from "./DatasetService";

function ViewDataset () {
  const datasetId = window.location.pathname.split("/")[2];
  const handleLoad = (dataset) => {
    return (
      dataset && <DatasetPanel dataset={dataset} />
    );
  }

  return (
    <div className="container pt-5">
      <View service={DatasetService.get} params={[datasetId]} handleLoad={handleLoad} />
    </div>
  );
}

export default ViewDataset;