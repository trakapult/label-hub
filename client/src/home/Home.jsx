import Datasets from "@/dataset/Datasets";
import Users from "@/user/Users";

function Home() {
  return (
    <div className="container pt-5">
      <div className="row">
        <div className="col-md-9">
          <Datasets />
        </div>
        <div className="col-md-3">
          <Users />
        </div>
      </div>
    </div>
  );
}

export default Home;