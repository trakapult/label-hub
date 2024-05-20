import { useState } from "react";
import View from "@/view/View";

function Users ({title, service, params=null, attrNames, attrs}) {
  const [search, setSearch] = useState("");

  const handleLoad = (rows) => {
    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              {attrNames.map((attr, index) => <th key={index}>{attr}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {attrs.map((attr, index) =>
                  <td key={index}>
                    {index ? row[attr] : <a href={`/user/${row[attr]}`} style={{textDecoration: "none"}}>{row[attr]}</a>}
                  </td>)
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header text-center bg-success text-white">{title}</div>
        <div className="card-body">
          {!params && 
            <form onSubmit={(e) => {e.preventDefault(); setSearch(e.target.search.value);}}>
              <div className="input-group input-group-sm mb-3">
                <input className="form-control" id="search" placeholder="搜索用户名" />
                <button className="btn btn-primary" type="submit">搜索</button>
              </div>
            </form>
          }
          <View service={service} params={params ? [params] : [search]} handleLoad={handleLoad} checkLogin={false} />
        </div>
      </div>
    </>
  );
}

export default Users;