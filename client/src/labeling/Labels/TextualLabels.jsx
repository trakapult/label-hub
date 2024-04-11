import { useEffect } from "react";

function TextualLabels ({sampleId=0, index=0, curLabel, saveLabel}) {
  useEffect(() => {
    const textualLabel = document.getElementById(`textualLabel${index}`);
    if (textualLabel)
      textualLabel.value = curLabel || "";
  }, [sampleId]);
  return (
    <div className="text-center">
      <textarea
        className="form-control mb-2"
        id={`textualLabel${index}`}
        placeholder="请输入文本"
        defaultValue={curLabel}
        required
        onChange={(e) => saveLabel(e.target.value)}
      />
    </div>
  );
}

export default TextualLabels;