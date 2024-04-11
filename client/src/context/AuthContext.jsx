import { createContext, useReducer, useEffect, useContext } from 'react';

const initialState = {
  isLoggedIn: false,
  user: "",
  token: ""
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'LOGIN':
      // console.log("user", action.user);
      // console.log("token", action.token);
      return {
        isLoggedIn: true,
        user: action.user,
        token: action.token
      };
    case 'LOGOUT':
      return {
        isLoggedIn: false,
        user: "",
        token: ""
      };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const loggedInState = localStorage.getItem("isLoggedIn");
    if (loggedInState === "true") {
      dispatch({
        type: "LOGIN",
        user: JSON.parse(localStorage.getItem("user")),
        token: localStorage.getItem("token")
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", state.isLoggedIn);
    localStorage.setItem("user", JSON.stringify(state.user));
    localStorage.setItem("token", state.token);
  }, [state]);

  return (
    <AuthContext.Provider value={{state, dispatch}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);