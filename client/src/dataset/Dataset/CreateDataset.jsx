import EditDatasetPanel from "./EditDatasetPanel";

function CreateDataset() {
  return (
    <div className="container pt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <EditDatasetPanel />
        </div>
      </div>
    </div>
  );
}

export default CreateDataset;