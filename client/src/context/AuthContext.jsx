import { createContext, useReducer, useEffect, useContext } from 'react';

const initialState = {
  isLoggedIn: false
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'LOGIN':
      return {...state, isLoggedIn: true};
    case 'LOGOUT':
      return {...state, isLoggedIn: false};
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    console.log(localStorage);
    const loggedInState = localStorage.getItem('isLoggedIn');
    console.log(localStorage, "loggedInState: ", loggedInState);
    if (loggedInState === "true") {
      dispatch({type: 'LOGIN'});
    }
  }, []);

  useEffect(() => {
    console.log("w state.isLoggedIn: ", localStorage.getItem('isLoggedIn'), state.isLoggedIn);
    localStorage.setItem('isLoggedIn', state.isLoggedIn);
    console.log("x state.isLoggedIn: ", localStorage.getItem('isLoggedIn'), state.isLoggedIn);
  }, [state.isLoggedIn]);

  return (
    <AuthContext.Provider value={{state, dispatch}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);