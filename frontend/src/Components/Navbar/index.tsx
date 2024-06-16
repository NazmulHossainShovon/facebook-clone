import { Link } from 'react-router-dom';
import AvatarMenu from '../AvatarMenu';
import { useContext } from 'react';
import { Store } from '../../Store';

function Navbar() {
  const {
    state: { userInfo },
  } = useContext(Store);

  return (
    <div className="flex justify-start pl-5 items-center gap-5 bg-TK-background   text-white h-[60px]">
      {userInfo ? (
        <>
          <Link to={'/'}>Home</Link>
          <AvatarMenu />
        </>
      ) : (
        <>
          <Link to={'/signup'}>Signup</Link>
          <Link to={'/login'}>Login</Link>
        </>
      )}
    </div>
  );
}

export default Navbar;
