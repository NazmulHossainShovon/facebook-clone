import { Link } from 'react-router-dom';
import AvatarMenu from '../AvatarMenu';

function Navbar() {
  return (
    <div className="flex justify-start items-center gap-5 bg-TK-background   text-white h-[60px]">
      <Link to={'/'}>Home</Link>
      <Link to={'/signup'}>Signup</Link>
      <AvatarMenu />
    </div>
  );
}

export default Navbar;
