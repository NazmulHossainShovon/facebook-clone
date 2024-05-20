import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../Store';

function Home() {
  const navigate = useNavigate();
  const { state } = useContext(Store);

  useEffect(() => {
    if (!state.userInfo) {
      navigate('/signup');
    }
  });

  return <div>Home</div>;
}

export default Home;
