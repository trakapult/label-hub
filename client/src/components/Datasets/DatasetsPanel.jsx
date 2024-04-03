import View from "../View";
import DatasetService from "../../services/DatasetService";
import dataText from "../../assets/icons/data_text.png";
import dataImage from "../../assets/icons/data_image.png";
import dataAudio from "../../assets/icons/data_audio.png";
import labelNumerical from "../../assets/icons/label_numerical.png";
import labelCategorical from "../../assets/icons/label_categorical.png";
import labelTextual from "../../assets/icons/label_textual.png";
import segmentsTrue from "../../assets/icons/segments_true.png";
import segmentsFalse from "../../assets/icons/segments_false.png";

function DatasetsPanel ({search, selections}) {
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
                <div className="card text-center mb-4" key={dataset.id}>
                  <div className="card-body">
                    <h3 className="card-title">{dataset.name}</h3>
                    <a className="badge bg-secondary mb-2 text-decoration-none" href={`/user/${dataset.admin}`}>@{dataset.admin}</a>
                    <p className="card-text">{dataset.description}</p>
                    <div className="d-flex justify-content-center mb-3 gap-2">
                      {dataset.dataType === "text" && <img src={dataText} alt="text" className="icon" />}
                      {dataset.dataType === "image" && <img src={dataImage} alt="image" className="icon" />}
                      {dataset.dataType === "audio" && <img src={dataAudio} alt="audio" className="icon" />}
                      {dataset.labelType === "numerical" && <img src={labelNumerical} alt="numerical" className="icon" />}
                      {dataset.labelType === "categorical" && <img src={labelCategorical} alt="categorical" className="icon" />}
                      {dataset.labelType === "textual" && <img src={labelTextual} alt="textual" className="icon" />}
                      {dataset.segments && <img src={segmentsTrue} alt="segmentsTrue" className="icon" />}
                      {!dataset.segments && <img src={segmentsFalse} alt="segmentsFalse" className="icon" />}
                    </div>
                    <a className="btn btn-primary" href={`/dataset/${dataset.id}`}>查看</a>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
    )
  };

  return (
    <View service={DatasetService.getAll} params={[search, selections]} handleLoad={handleLoad} />
  );
}

export default DatasetsPanel;