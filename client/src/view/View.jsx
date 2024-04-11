import { useState, useEffect } from 'react';
import { useAuthContext } from "../context/AuthContext";
import Loading from "../common/Loading";
import Error from "../common/Error";

function View ({service, params, handleLoad}) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const {state} = useAuthContext();

  const get = async () => {
    try {
      const res = await service(state.token, ...params);
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
  }, [state, params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        return;
      }
      if (!state.isLoggedIn) {
        setError("请先注册或登录");
      } else if (error !== "") {
        setError("加载时出现错误");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  return (
    <>
      {content === null && !error && <Loading />}
      {content !== null && !error && handleLoad(content)}
      {error && <Error error={error} />}
    </>
  );
}

export default View;