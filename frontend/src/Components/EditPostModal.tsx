import { Box, Button, Modal, TextField } from '@mui/material';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { modalStyle } from '../Constants/constants';
import { useUpdatePost } from '../Hooks/postHooks';

const EditPostModal = forwardRef((props, ref) => {
  const { post, id, onPostUpdate } = props;

  const [modalOpen, setModalOpen] = useState(false);
  const [updatedPost, setUpdatedPost] = useState(post);
  const { mutateAsync: updatePost } = useUpdatePost();

  useImperativeHandle(ref, () => ({
    handleModalOpen: () => setModalOpen(true),
  }));

  const handleModalClose = () => setModalOpen(false);

  const handleUpdatePost = async () => {
    const result = await updatePost({ post: updatedPost, id: id });
    onPostUpdate(result.doc);
    handleModalClose();
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          display: 'flex',
          gap: '20px',
          flexDirection: 'column',
          ...modalStyle,
        }}
      >
        {' '}
        <TextField
          onChange={e => setUpdatedPost(e.target.value)}
          label="Update Post"
          defaultValue={post}
          multiline
        />
        <Button onClick={handleUpdatePost}>Update</Button>
      </Box>
    </Modal>
  );
});

EditPostModal.displayName = 'EditPostModal';

export default EditPostModal;
