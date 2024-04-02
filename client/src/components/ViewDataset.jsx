import View from "./View";
import DatasetService from "../services/DatasetService";

function ViewDataset () {
  const datasetId = window.location.pathname.split("/")[2];
  const handleChange = (dataset) => {
    return(
      dataset && (
        <div className="card pt-4 pb-4">
          <div className="card-body">
            <h2 className="card-title mb-5">{dataset.name}</h2>
            <p className="card-text">{dataset.description}</p>
            <div>dataType: {dataset.dataType}</div>
            <div>labelType: {dataset.labelType}</div>
            <div>segment: {dataset.segment ? "yes" : "no"}</div>
          </div>
        </div>
      )
    );
  }

  return (
    <View service={DatasetService.get} args={[datasetId]} handleChange={handleChange} />
  );
}

export default ViewDataset;