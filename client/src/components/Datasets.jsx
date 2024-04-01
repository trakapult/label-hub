import { useState, useEffect } from 'react';
import DatasetService from '../services/DatasetService';

function Datasets () {
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const getAll = async () => {
      try {
        const res = await DatasetService.getAll();
        if (res.error) {
          setError(res.error);
          return;
        }
        setDatasets(res.data);
      } catch (err) {
        setError(err.response.data.error);
      }
    }
    getAll();
  }, []);
  // place 3 datasets per row
  return (
    <>
      <div className="container pt-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          {datasets.map(dataset => (
            <div className="col-md-4" key={dataset.id}>
              <div className="card mb-4 text-center">
                <div className="card-body mt-3">
                  <h5 className="card-title">{dataset.name}</h5>
                  <p className="card-text">{dataset.description}</p>
                  <a href={`/datasets/${dataset.id}`} className="btn btn-primary">查看</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Datasets;