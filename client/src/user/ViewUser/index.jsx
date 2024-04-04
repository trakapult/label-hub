import View from "../../view/View";
import UserService from "../UserService";
import ViewAdminDatasets from "./ViewAdminDatasets";

function ViewUser () {
  const userName = window.location.pathname.split("/")[2];
  const handleLoad = (user) => {
    return (
      user && (
        <div className="card pt-4 pb-4">
          <div className="card-body">
            <h2 className="card-title">{user.name}</h2>
            <div className="badge bg-primary mb-5">{user.email}</div>
            <ViewAdminDatasets name={user.name} />
          </div>
        </div>
      )
    );
  }

  return (
    <div className="container pt-5">
      <View service={UserService.get} params={[userName]} handleLoad={handleLoad} />
    </div>
  );
}

export default ViewUser;