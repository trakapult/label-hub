import View from "../../view/View";
import DatasetService from "../DatasetService";
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
                  <div className="row justify-content-center">
                    <div className="col-md-4">
                      <div className="d-flex justify-content-center mb-3 gap-2">
                        {dataset.dataType === "text" && <img  className="icon" src={dataText} alt="text" />}
                        {dataset.dataType === "image" && <img className="icon" src={dataImage} alt="image" />}
                        {dataset.dataType === "audio" && <img className="icon" src={dataAudio} alt="audio" />}
                        {dataset.labelType === "numerical" && <img className="icon" src={labelNumerical} alt="numerical" />}
                        {dataset.labelType === "categorical" && <img className="icon" src={labelCategorical} alt="categorical" />}
                        {dataset.labelType === "textual" && <img className="icon" src={labelTextual} alt="textual" />}
                        {dataset.segments && <img className="icon" src={segmentsTrue} alt="segmentsTrue" />}
                        {!dataset.segments && <img className="icon" src={segmentsFalse} alt="segmentsFalse" />}
                      </div>
                    </div>
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