import { MoreHoriz } from '@mui/icons-material';
import { Avatar, Button, Menu, MenuItem } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useDeletePost, useLikePost } from '../Hooks/postHooks';
import { Store } from '../Store';

type PostCardProps = {
  id: string;
  text: string;
  authorName: string;
  authorImage: string;
  createdAt: string;
  isLoggedInUser: boolean;
  refetch: () => void;
  likers: string[];
};

function convertDateFormat(dateString) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

export default function PostCard({
  text,
  authorName,
  authorImage,
  createdAt,
  id,
  refetch,
  isLoggedInUser,
  likers,
}: PostCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    state: { userInfo },
  } = useContext(Store);
  const { mutateAsync: deletePost } = useDeletePost();
  const { mutateAsync: likePost } = useLikePost();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleDelete = async () => {
    await deletePost({ id });
    await refetch();
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLike = async () => {
    const data = await likePost({ userName: userInfo.name, postId: id });
    await refetch();
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-lg w-[30%] p-3 border border-gray-200 shadow">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Avatar className="mt-1" src={authorImage} />
          <div>
            <p className="font-bold">{authorName}</p>
            <p className=" text-xs">{convertDateFormat(createdAt)}</p>
          </div>
        </div>
        {/* options button and menu */}
        <div>
          <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreHoriz />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {isLoggedInUser && (
              <MenuItem onClick={handleDelete}>Delete Post</MenuItem>
            )}
            <MenuItem>Share</MenuItem>
          </Menu>
        </div>
      </div>

      <p>{text}</p>
      <Button onClick={handleLike} variant="outlined">
        {likers.includes(userInfo.name) ? 'Unlike' : 'Like'}
      </Button>
    </div>
  );
}
