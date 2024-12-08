import React, { useState } from 'react';
import { useUpdatePost } from '../Hooks/postHooks';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const EditPostModal = props => {
  const { post, id, onPostUpdate } = props;
  const [updatedPost, setUpdatedPost] = useState(post);
  const { mutateAsync: updatePost } = useUpdatePost();

  const handleUpdatePost = async () => {
    const result = await updatePost({ post: updatedPost, id: id });
    onPostUpdate(result.doc);
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full text-left pl-2 hover:bg-slate-100">
        Edit
      </DialogTrigger>
      <DialogContent>
        <div className="w-[50%] flex flex-col gap-7">
          <Textarea
            onChange={e => setUpdatedPost(e.target.value)}
            label="Update Post"
            defaultValue={post}
          />
          <Button onClick={handleUpdatePost}>Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

EditPostModal.displayName = 'EditPostModal';

export default EditPostModal;
