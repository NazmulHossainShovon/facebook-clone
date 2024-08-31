import { Link, useNavigate } from 'react-router-dom';
import AvatarMenu from '../AvatarMenu';
import { useContext, useState } from 'react';
import { Store } from '../../Store';
import Input from '../Input';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import FriendReqsMenu from '../FriendReqsMenu';
import { Box, Button, Drawer } from '@mui/material';

function Navbar() {
  const {
    state: { userInfo },
  } = useContext(Store);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleSearchQuery = () => {
    navigate(`/search/${searchQuery}`);
  };

  return (
    <div className="flex justify-between md:justify-start pl-5 items-center gap-5 bg-TK-background  text-white h-[60px]">
      {userInfo ? (
        <>
          <Link to={'/'}>Home</Link>
          <AvatarMenu />
          <div className="hidden md:flex  flex-row ml-5 items-center gap-2">
            <Input
              placeholder="Search anything..."
              onChange={e => setSearchQuery(e.target.value)}
            />
            <SearchIcon
              onClick={handleSearchQuery}
              className=" cursor-pointer"
            />
          </div>
          <FriendReqsMenu />

          <MenuIcon className="block md:hidden" onClick={toggleDrawer(true)} />
          <Drawer open={open} onClose={toggleDrawer(false)}>
            <Box
              sx={{ width: 250, paddingLeft: '10px', paddingTop: '10px' }}
              role="presentation"
            >
              <div className="flex m-3 flex-row ml-5 items-center gap-2">
                <Input
                  placeholder="Search anything..."
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <SearchIcon
                  onClick={handleSearchQuery}
                  className=" cursor-pointer"
                />
              </div>
            </Box>
          </Drawer>
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
