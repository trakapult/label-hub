import View from "@/view/View";
import DatasetService from "../DatasetService";
import DatasetCard from "../Dataset/DatasetCard";

function DatasetsPanel ({search, selections}) {
  console.log("selections", JSON.stringify(selections));
  const handleLoad = (datasets) => {
    const subsets = [[], [], []];
    datasets.forEach((dataset, index) => {
      subsets[index % 3].push(dataset);
    });

    return (
      <div className="row">
        {subsets.map((subset, index) => (
          <div className="col-md-4" key={index}>
            {subset.map((dataset) => (
              <DatasetCard dataset={dataset} key={dataset.id} />
            ))}
          </div>
        ))}
      </div>
    )
  };

  return (
    <View service={DatasetService.getAll} params={[search, selections]} handleLoad={handleLoad} checkLogin={false} />
  );
}

export default DatasetsPanel;