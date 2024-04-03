function UserForm({title, attrs, error, buttonName, handleSubmit}) {
  return (
    <div className="card pt-4 pb-4">
      <form className="card-body text-center" onSubmit={(e) => {e.preventDefault(); handleSubmit(e);}}>
        <h2 className="card-title mb-5">{title}</h2>
        {attrs.map((attr, index) =>
          <div className="form-floating mb-3" key={index}>
            <input className="form-control" type={attr.type} id={attr.type} placeholder="" required />
            <label htmlFor={attr.type}>{attr.label}</label>
            {attr.message && <div className="form-text">{attr.message}</div>}
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary" type="submit">{buttonName}</button>
      </form>
    </div>
  );
}

export default UserForm;