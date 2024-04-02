import { useState, useEffect } from 'react';
import { useAuthContext } from "../context/AuthContext";

function View ({service, args, handleChange}) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const {state} = useAuthContext();

  const get = async () => {
    try {
      const res = await service(state.token, ...args);
      if (res.error) {
        setError(res.error);
        return;
      }
      setContent(res.data);
      setError("");
    } catch (err) {
      console.log(err);
      setError(err.response.data.error);
    }
  }

  useEffect(() => {
    if (state.isLoggedIn) {
      get();
    }
  }, [state]);

  // if loading spinner spins for 10 seconds, show error message
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        return;
      }
      if (!state.isLoggedIn) {
        setError("请先注册或登录");
      } else {
        setError("加载时出现错误");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  const loading = (
    <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container pt-5">
      {content === null && error === "" ? loading : handleChange(content)}
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default View;