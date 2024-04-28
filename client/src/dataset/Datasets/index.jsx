import { useState } from "react";
import DatasetsPanel from "./DatasetsPanel";
import DatasetsSearchPanel from "./DatasetsSearchPanel";

function Datasets () {
  const [search, setSearch] = useState("");
  const [selections, setSelections] = useState({admin: "", dataType: "", labelType: "", segments: null});

  return (
    <>
      <DatasetsSearchPanel
        handleSearch={(e) => setSearch(e.target.search.value)}
        handleSelection={(e) => setSelections({...selections, [e.target.id]: e.target.value})}
      />
      <DatasetsPanel search={search} selections={selections} />
    </>
  );
}

export default Datasets;