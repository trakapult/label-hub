import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Timer({minutes, navigateTo}) {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(minutes * 60);
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(navigateTo);
    }, minutes * 60 * 1000);
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    }
  }, [minutes, navigateTo]);
  return (
    <div className="progress justify-content-end mb-3">
      <div className="progress-bar progress-bar-striped progress-bar-animated"
        style={{width: `${(1 - seconds / (minutes * 60)) * 100}%`}}
      />
      <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning text-dark text-start"
        style={{width: `${(seconds / (minutes * 60)) * 100}%`}}>
        &nbsp;{Math.floor(seconds / 60)}:{seconds % 60 < 10 ? "0" : ""}{seconds % 60}
      </div>
    </div>
  );
}

export default Timer;