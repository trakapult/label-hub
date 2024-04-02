import View from "./View";
import UserService from "../services/UserService";

function ViewUser () {
  const userId = window.location.pathname.split("/")[2];
  const handleChange = (user) => {
    return (
      <div className="card pt-4 pb-4">
        <div className="card-body">
          <h2 className="card-title mb-5">{user.name}</h2>
          <div>email: {user.email}</div>
        </div>
      </div>
    );
  }

  return (
    <View service={UserService.get} args={[userId]} handleChange={handleChange} />
  );
}

export default ViewUser;