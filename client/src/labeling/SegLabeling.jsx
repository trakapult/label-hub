import TextSegLabeling from "./TextSegLabeling";
import ImageSegLabeling from "./ImageSegLabeling";
import AudioSegLabeling from "./AudioSegLabeling";

function SegLabeling ({sampleId, file, fileInfo, dataType, labelType, labelInfo, curLabelData, saveLabelData}) {
  if (dataType === "text") {
    return (
      <TextSegLabeling
        sampleId={sampleId}
        file={file}
        fileInfo={fileInfo}
        labelType={labelType}
        labelInfo={labelInfo}
        curLabelData={curLabelData}
        saveLabelData={saveLabelData}
      />
    );
  } else if (dataType === "image") {
    return (
      <ImageSegLabeling
        sampleId={sampleId}
        file={file}
        fileInfo={fileInfo}
        labelType={labelType}
        labelInfo={labelInfo}
        curLabelData={curLabelData}
        saveLabelData={saveLabelData}
      />
    );
  } else if (dataType === "audio") {
    return (
      <AudioSegLabeling
        sampleId={sampleId}
        file={file}
        fileInfo={fileInfo}
        labelType={labelType}
        labelInfo={labelInfo}
        curLabelData={curLabelData}
        saveLabelData={saveLabelData}
      />
    );
  }
  return null;
}

export default SegLabeling;