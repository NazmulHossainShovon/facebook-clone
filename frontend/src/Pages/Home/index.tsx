import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/signup');
  });

  return <div>Home</div>;
}

export default Home;
