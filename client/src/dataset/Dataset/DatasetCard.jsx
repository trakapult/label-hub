import Icons from "../Icons";

function DatasetCard ({dataset}) {
  return (
    <div className="card text-center mb-4" key={dataset.id}>
      <div className="card-body">
        <h3 className="card-title">{dataset.name}</h3>
        <a className="badge bg-secondary mb-2 text-decoration-none" href={`/user/${dataset.admin}`}>@{dataset.admin}</a>
        <p className="card-text">{dataset.description}</p>
        <div className="row justify-content-center">
          <div className="col-md-4">
            <Icons type={dataset.type} dataType={dataset.dataType} labelType={dataset.labelType} segments={dataset.segments} />
          </div>
        </div>
        <a className="btn btn-primary" href={`/dataset/${dataset.id}`}>查看</a>
      </div>
    </div>
  );
}

export default DatasetCard;