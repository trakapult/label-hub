function CategoricalLabels ({labelInfo, curLabel, saveLabel, formtext=true}) {
  return (
    <div className="text-center">
      <div className="btn-group" onClick={(e) => saveLabel(e.target.value)}>
        {labelInfo.map((label, index) => (
          <button
            className={"btn " + (label === curLabel ? "btn-success" : "btn-primary")}
            type="button"
            value={label}
            id={`button${index + 1}`}
            key={index}
          >
            {label}
          </button>
        ))}
      </div>
      {formtext && <div className="form-text">可按单个数字键i输入第i个标签</div>}
    </div>
  );
}

export default CategoricalLabels;