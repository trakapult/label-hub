import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/datasets");
  }, [navigate]);
  
  return (
    <div className="container pt-5">
      <h1>Home</h1>
    </div>
  );
}

export default Home;