import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../Store';

function Home() {
  const navigate = useNavigate();
  const {
    state: { userInfo },
  } = useContext(Store);

  useEffect(() => {
    const userJson = localStorage.getItem('user-info');
    if (!userJson) {
      navigate('/signup');
    }
  }, [navigate]);

  return (
    <div className=" align-middle text-center text-lg font-bold text-blue-600">
      Hi {userInfo?.name}
    </div>
  );
}

export default Home;
