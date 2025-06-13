import { Menu, MenuItem } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import React, { useContext } from 'react';
import { Store } from '../Store';
import { Link, useNavigate } from 'react-router-dom';

export default function AvatarMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { dispatch, state } = useContext(Store);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch({ type: 'sign-out' });
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-info');
    navigate('/login');
  };

  return (
    <div>
      <Avatar
        src={`https://shovon-s3.s3.us-east-1.amazonaws.com/facebook/${state.userInfo.name}.png`}
        className="cursor-pointer"
        onClick={handleClick}
      />
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
        <MenuItem>
          <Link to={`/${state.userInfo.name}`}>Profile</Link>
        </MenuItem>
      </Menu>
    </div>
  );
}
