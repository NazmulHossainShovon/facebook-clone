import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../../Store';
import { Box, Button, Modal, TextField } from '@mui/material';
import { useCreatePost } from '../../Hooks/postHooks';

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

function Home() {
  const navigate = useNavigate();
  const {
    state: { userInfo },
  } = useContext(Store);
  const [post, setPost] = useState('');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { mutateAsync: createPost } = useCreatePost();

  const handlePost = async () => {
    const res = await createPost({ post });
    console.log(res);
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user-info');
    if (!userJson) {
      navigate('/signup');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col gap-3 items-center align-middle ">
      <h1 className="text-center text-lg font-bold text-blue-600">
        Hi {userInfo?.name}
      </h1>

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
    </div>
  );
}

export default Home;
