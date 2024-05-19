import Datasets from "@/dataset/Datasets";
import Users from "@/user/Users";
import UserService from "@/user/UserService";

function Home() {
  return (
    <div className="container pt-5">
      <div className="row">
        <div className="col-md-9">
          <Datasets />
        </div>
        <div className="col-md-3">
          <Users title="🌟明星用户🌟" service={UserService.getAll} attrNames={["用户名", "积分"]} attrs={["name", "points"]} />
        </div>
      </div>
    </div>
  );
}

export default Home;