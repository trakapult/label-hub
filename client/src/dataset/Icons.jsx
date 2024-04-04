import dataText from "../assets/icons/data_text.png";
import dataImage from "../assets/icons/data_image.png";
import dataAudio from "../assets/icons/data_audio.png";
import labelNumerical from "../assets/icons/label_numerical.png";
import labelCategorical from "../assets/icons/label_categorical.png";
import labelTextual from "../assets/icons/label_textual.png";
import segmentsTrue from "../assets/icons/segments_true.png";
import segmentsFalse from "../assets/icons/segments_false.png";

function Icons ({dataType, labelType, segments}) {
  return (
    <div className="d-flex justify-content-center mb-3 gap-2">
      {dataType === "text" && <img  className="icon" src={dataText} alt="text" />}
      {dataType === "image" && <img className="icon" src={dataImage} alt="image" />}
      {dataType === "audio" && <img className="icon" src={dataAudio} alt="audio" />}
      {labelType === "numerical" && <img className="icon" src={labelNumerical} alt="numerical" />}
      {labelType === "categorical" && <img className="icon" src={labelCategorical} alt="categorical" />}
      {labelType === "textual" && <img className="icon" src={labelTextual} alt="textual" />}
      {segments && <img className="icon" src={segmentsTrue} alt="segmentsTrue" />}
      {!segments && <img className="icon" src={segmentsFalse} alt="segmentsFalse" />}
    </div>
  );
}

export default Icons;