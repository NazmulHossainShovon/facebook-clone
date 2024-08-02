import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Box, Button, Modal, TextField } from '@mui/material';
import { useCreatePost, useGetPosts } from '../Hooks/postHooks';
import PostCard from '../Components/PostCard';
import { useGetUserInfo } from '../Hooks/userHook';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: 450,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function UserProfile() {
  const navigate = useNavigate();
  const { userName } = useParams();
  const [post, setPost] = useState('');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { mutateAsync: createPost } = useCreatePost();
  const { data: userInfo } = useGetUserInfo(userName);
  const { data, refetch } = useGetPosts(userName);

  const handlePost = async () => {
    const res = await createPost({ post });
    await refetch();
    handleClose();
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user-info');
    if (!userJson) {
      navigate('/signup');
    }
  }, [navigate]);
  console.log(userInfo);

  return (
    <div className="flex flex-col gap-3 items-center align-middle bg-[#F0F2F5] h-screen">
      <div className="flex flex-col gap-3 bg-white rounded-lg w-[30%] p-3 border border-gray-200 shadow">
        <Avatar src={userInfo?.image} className=" w-32 h-32" />
        <h2>{userInfo?.name}</h2>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField
            onChange={e => setPost(e.target.value)}
            label="Create Post"
            multiline
          />
          <Button onClick={handlePost}>Post</Button>
        </Box>
      </Modal>
      <Button onClick={handleOpen} variant="outlined">
        Whats on your mind?
      </Button>

      {data?.map((post, index) => (
        <PostCard
          key={index}
          text={post.post}
          authorImage={post.authorImage}
          authorName={post.authorName}
          createdAt={post.createdAt}
          id={post._id}
          refetch={refetch}
        />
      ))}
    </div>
  );
}

export default UserProfile;
