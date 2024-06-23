import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import UserProfile from './Pages/UserProfile';
import Signup from './Pages/Signup';
import useFindUser from './Hooks/useFindUser';
import Login from './Pages/Login';
import { useContext } from 'react';
import { Store } from './Store';
import Home from './Pages/Home';

const App: React.FC = () => {
  useFindUser();
  const {
    state: { userInfo },
  } = useContext(Store);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={`/${userInfo?.name}`} element={<UserProfile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
