import { Button, Menu, MenuItem } from '@mui/material';
import { useContext, useState } from 'react';
import { Store } from '../Store';
import { useUnfriend } from '../Hooks/userHook';

type FriendOptionsProps = {
  tempUser: string;
  refetch: () => void;
};

export default function FriendOptionsMenu({
  tempUser,
  refetch,
}: FriendOptionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    state: { userInfo },
  } = useContext(Store);
  const { mutateAsync: unfriend } = useUnfriend();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUnfriend = async () => {
    await unfriend({ user1: userInfo.name, user2: tempUser });
    await refetch();
  };

  return (
    <div>
      <Button onClick={handleClick}>Friends</Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        className="p-2"
      >
        <MenuItem onClick={handleUnfriend}>Unfriend</MenuItem>
      </Menu>
    </div>
  );
}
