import { Link } from 'react-router-dom';
import AvatarMenu from '../AvatarMenu';
import { useContext } from 'react';
import { Store } from '../../Store';

function Navbar() {
  const {
    state: { userInfo },
  } = useContext(Store);

  return (
    <div className="flex justify-start items-center gap-5 bg-TK-background   text-white h-[60px]">
      <Link to={'/'}>Home</Link>
      <Link to={'/signup'}>Signup</Link>
      {userInfo && <AvatarMenu />}
    </div>
  );
}

export default Navbar;
