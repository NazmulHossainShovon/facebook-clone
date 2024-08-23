import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Box, Button, Modal, TextField } from '@mui/material';
import { useCreatePost, useGetPosts } from '../Hooks/postHooks';
import PostCard from '../Components/PostCard';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useGetUserInfo,
  useSendFriendRequest,
} from '../Hooks/userHook';
import { Store } from '../Store';
import FriendOptionsMenu from '../Components/FriendOptionsMenu';

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
  const {
    state: { userInfo },
  } = useContext(Store);
  const { mutateAsync: createPost } = useCreatePost();
  const { data: userData, refetch: refetchUser } = useGetUserInfo(userName);
  const { data, refetch } = useGetPosts(userName);
  const { mutateAsync: sendRequest } = useSendFriendRequest();
  const { mutateAsync: cancelRequest } = useCancelFriendRequest();
  const { mutateAsync: acceptRequest } = useAcceptFriendRequest();
  const isLoggedInUser = userInfo.name === userName;

  const handlePost = async () => {
    const res = await createPost({ post });
    await refetch();
    handleClose();
  };

  const sendFriendRequest = async () => {
    await sendRequest({ sender: userInfo.name, receiver: userName });
    await refetchUser();
  };

  const handleCancelRequest = async () => {
    await cancelRequest({ sender: userInfo.name, receiver: userName });
    await refetchUser();
  };

  const handleAcceptRequest = async () => {
    await acceptRequest({ sender: userName, receiver: userInfo.name });
    await refetchUser();
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user-info');
    if (!userJson) {
      navigate('/signup');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col gap-3 items-center align-middle bg-[#F0F2F5] h-screen">
      <div className="flex flex-col gap-3 bg-white rounded-lg w-[30%] p-3 border border-gray-200 shadow">
        <Avatar
          src={`https://nazmul.sirv.com/facebook/${userName}.png`}
          className=" w-32 h-32"
        />
        <h2>{userData?.name}</h2>
        {!isLoggedInUser && (
          <>
            {userData?.receivedFriendReqs.includes(userInfo.name) ? (
              <Button onClick={handleCancelRequest}>Cancel Request</Button>
            ) : userData?.sentFriendReqs.includes(userInfo.name) ? (
              <Button onClick={handleAcceptRequest}>Accept Request</Button>
            ) : userData?.friends.includes(userInfo.name) ? (
              <FriendOptionsMenu tempUser={userName} refetch={refetchUser} />
            ) : (
              <Button onClick={sendFriendRequest}>Send Request </Button>
            )}
          </>
        )}
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
      {isLoggedInUser && (
        <Button onClick={handleOpen} variant="outlined">
          Whats on your mind?
        </Button>
      )}

      {data?.map((post, index) => (
        <PostCard
          key={index}
          text={post.post}
          authorName={post.authorName}
          createdAt={post.createdAt}
          id={post._id}
          refetch={refetch}
          likers={post.likers}
          isLoggedInUser={isLoggedInUser}
        />
      ))}
    </div>
  );
}

export default UserProfile;
