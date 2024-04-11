import { useState } from "react";
import DatasetsPanel from "./DatasetsPanel";
import DatasetsSearchPanel from "./DatasetsSearchPanel";

function Datasets () {
  const [search, setSearch] = useState("");
  const [selections, setSelections] = useState({admin: "", dataType: "", labelType: "", segments: null});
  
  const handleSearch = (e) => {
    setSearch(e.target.search.value);
  }
  const handleSelection = (e) => {
    setSelections({...selections, [e.target.id]: e.target.value});
  }

  return (
    <div className="container pt-5">
      <DatasetsSearchPanel handleSearch={handleSearch} handleSelection={handleSelection} />
      <DatasetsPanel search={search} selections={selections} />
    </div>
  );
}

export default Datasets;