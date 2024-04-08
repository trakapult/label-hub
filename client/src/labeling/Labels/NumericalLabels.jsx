function NumericalLabels ({labelInfo, curLabel, saveLabel, formtext=true}) {
  return (
    <div className="text-center">
      <div className="d-flex justify-content-center gap-2" onClick={(e) => saveLabel(e.target.value)}>
        {Array.from({length: labelInfo.max - labelInfo.min + 1}, (_, index) => (
          <button
            className={"btn rounded-circle " + (labelInfo.min + index === parseInt(curLabel) ? "btn-success" : "btn-primary")}
            type="button"
            value={labelInfo.min + index}
            id={`button${labelInfo.min + index}`}
            key={index}
          >
            {labelInfo.min + index}
          </button>
        ))}
      </div>
      {formtext && <div className="form-text">可按单个数字键输入对应标签</div>}
    </div>
  );
}

export default NumericalLabels;