import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import Loading from "@/common/Loading";
import Error from "@/common/Error";

function View ({service, params, handleLoad, checkLogin=true}) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const {state} = useAuthContext();

  const get = async () => {
    try {
      const res = await service(state.token, ...params);
      setContent(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response.data.error);
    }
  }

  useEffect(() => {
    if (!checkLogin || state.isLoggedIn) {
      get();
    }
  }, [checkLogin, state, params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkLogin && !state.isLoggedIn) {
        setError("请先注册或登录");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [checkLogin, state.isLoggedIn]);

  return (
    <>
      {content === null && !error && <Loading />}
      {content !== null && !error && handleLoad(content)}
      {error && <Error error={error} />}
    </>
  );
}

export default View;