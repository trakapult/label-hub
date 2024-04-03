import View from "../view/View";
import UserService from "./UserService";

function ViewUser () {
  const userName = window.location.pathname.split("/")[2];
  const handleLoad = (user) => {
    return (
      user && (
        <div className="card pt-4 pb-4">
          <div className="card-body">
            <h2 className="card-title mb-5">{user.name}</h2>
            <div>email: {user.email}</div>
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