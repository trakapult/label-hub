import { useState, useEffect } from 'react';
import DatasetService from '../services/DatasetService';

function ViewDataset () {
  const [dataset, setDataset] = useState({});
  const [error, setError] = useState("");
  const datasetId = window.location.pathname.split("/")[2];

  useEffect(() => {
    const get = async () => {
      try {
        const res = await DatasetService.get(datasetId);
        if (res.error) {
          setError(res.error);
          return;
        }
        setDataset(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    get();
  }, []);

  return (
    <>
      <div className="container pt-5">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card pt-4 pb-4">
          <div className="card-body">
            <h2 className="card-title mb-5">{dataset.name}</h2>
            <p className="card-text">{dataset.description}</p>
            <div>dataType: {dataset.dataType}</div>
            <div>labelType: {dataset.labelType}</div>
            <div>segment: {dataset.segment}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewDataset;