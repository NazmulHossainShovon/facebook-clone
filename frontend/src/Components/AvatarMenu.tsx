import { Menu, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import React, { useContext } from 'react';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';

export default function AvatarMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { dispatch } = useContext(Store);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('user-info');
    navigate('/login');
  };

  return (
    <div>
      <Avatar className="cursor-pointer" onClick={handleClick}>
        S
      </Avatar>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
