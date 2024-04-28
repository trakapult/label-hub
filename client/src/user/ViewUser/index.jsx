import { useParams } from "react-router-dom";
import UserService from "../UserService";
import View from "@/view/View";
import ViewAdminDatasets from "./ViewAdminDatasets";
import ViewLabeledDatasets from "./ViewLabeledDatasets";

function ViewUser () {
  const name = useParams().name;
  const handleLoad = (user) => {
    return (
      user && (
        <div className="card pt-4 pb-4">
          <div className="card-body">
            <h2 className="card-title">{user.name}</h2>
            <div className="d-flex gap-2">
              <div className="badge bg-secondary mb-5">{user.email}</div>
              <div className="badge bg-primary mb-5">积分：{user.points}</div>
            </div>
            <ViewAdminDatasets name={user.name} />
            <br />
            <ViewLabeledDatasets name={user.name} />
          </div>
        </div>
      )
    );
  }

  return (
    <div className="container pt-5">
      <View service={UserService.get} params={[name]} handleLoad={handleLoad} checkLogin={false} />
    </div>
  );
}

export default ViewUser;