import { Box, Button, Modal, TextField } from '@mui/material';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { modalStyle } from '../Constants/constants';

const EditPostModal = forwardRef((props, ref) => {
  const { post } = props;

  const [modalOpen, setModalOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    handleModalOpen: () => setModalOpen(true),
  }));

  const handleModalClose = () => setModalOpen(false);

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
          onChange={e => console.log(e.target.value)}
          label="Create Post"
          defaultValue={post}
          multiline
        />
        <Button>Post</Button>
      </Box>
    </Modal>
  );
});

EditPostModal.displayName = 'EditPostModal';

export default EditPostModal;
