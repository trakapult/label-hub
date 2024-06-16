function NumericalLabels ({labelInfo, curLabel, saveLabel, formtext=true}) {
  const min = parseInt(labelInfo.min), max = parseInt(labelInfo.max);
  return (
    <div className="text-center">
      <div className="d-flex justify-content-center gap-2" onClick={(e) => saveLabel(e.target.value)}>
        {Array.from({length: max - min + 1}, (_, index) => (
          <button
            className={"btn rounded-circle " + (min + index === parseInt(curLabel) ? "btn-success" : "btn-primary")}
            type="button"
            value={min + index}
            id={`button${min + index}`}
            key={index}
          >
            {min + index}
          </button>
        ))}
      </div>
      {formtext && <div className="form-text">可按单个数字键输入对应标签</div>}
    </div>
  );
}

export default NumericalLabels;