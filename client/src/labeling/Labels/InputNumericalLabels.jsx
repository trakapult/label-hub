import { useEffect } from "react";

function InputNumericalLabels ({sampleId=0, index=0, labelInfo, curLabel, saveLabel}) {
  useEffect(() => {
    const textualLabel = document.getElementById(`textualLabel${index}`);
    if (textualLabel)
      textualLabel.value = curLabel || "";
  }, [sampleId]);
  return (
    <div className="text-center">
      <input
        className="form-control mb-2"
        type="number"
        id={`textualLabel${index}`}
        placeholder="请输入数字"
        min={labelInfo.min}
        max={labelInfo.max}
        defaultValue={curLabel}
        required
        onChange={(e) => saveLabel(e.target.value)}
      />
    </div>
  );
}

export default InputNumericalLabels;