import View from "./View";
import DatasetService from '../services/DatasetService';

function Datasets () {
  const handleChange = (datasets) => {
    return (
      datasets && (
        <div className="row">
          {datasets.map(dataset => (
            <div className="col-md-4" key={dataset.id}>
              <div className="card mb-4 text-center">
                <div className="card-body mt-3">
                  <h5 className="card-title">{dataset.name}</h5>
                  <p className="card-text">{dataset.description}</p>
                  <a href={`/dataset/${dataset.id}`} className="btn btn-primary">查看</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    );
  }
  
  return (
    <View service={DatasetService.getAll} args={[]} handleChange={handleChange} />
  );
}

export default Datasets;