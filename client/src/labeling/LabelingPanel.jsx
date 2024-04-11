import { useEffect, useState } from "react";
import NumericalLabels from "./Labels/NumericalLabels";
import CategoricalLabels from "./Labels/CategoricalLabels";
import TextualLabels from "./Labels/TextualLabels";
import SaveButton from "./SaveButton";

const height = 300;

function LabelingPanel ({sampleId, file, dataType, labelType, labelInfo, curLabel, saveLabel}) {
  const [textualLabel, setTextualLabel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (labelType === "textual") {
      if (curLabel) {
        setTextualLabel(curLabel);
        setSaved(true);
      } else {
        setTextualLabel("");
        setSaved(false);
      }
    }
  }, [sampleId, curLabel]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        const button = document.getElementById(`button${e.key}`);
        if (button) button.click();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  return (
    <>
      <div className="row justify-content-center mb-3">
        <div className="col-md-6 border rounded-end overflow-auto" style={{maxHeight: height}}>
          <div className="img-container">
            {dataType === "text" && <p>{file}</p>}
            {dataType === "image" && <img src={`data:image;base64,${btoa(file)}`} alt="sample" />}
            {dataType === "audio" && <audio src={`data:audio/mp3;base64,${btoa(file)}`} controls />}
          </div>
        </div>
      </div>
      <div className="row justify-content-center mb-3">
        <div className="col-md-6">
          {labelType === "numerical" &&
            <NumericalLabels labelInfo={labelInfo} curLabel={curLabel} saveLabel={saveLabel} />
          }
          {labelType === "categorical" && (
            <CategoricalLabels labelInfo={labelInfo} curLabel={curLabel} saveLabel={saveLabel} />
          )}
          {labelType === "textual" && (
            <form className="row justify-content-center" onSubmit={(e) => {e.preventDefault(); saveLabel(textualLabel); setSaved(true);}}>
              <TextualLabels sampleId={sampleId} curLabel={curLabel} saveLabel={(e) => {setTextualLabel(e); setSaved(false);}} />
              <SaveButton saved={saved} />
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default LabelingPanel;