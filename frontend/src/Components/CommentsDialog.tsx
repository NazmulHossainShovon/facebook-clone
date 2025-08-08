import { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import { CommentType } from '../Types/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

type CommentsDialogProps = {
  comments: CommentType[];
  onComment: (comment: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  currentUserName: string;
};

export default function CommentsDialog({
  comments,
  onComment,
  onDeleteComment,
  currentUserName,
}: CommentsDialogProps) {
  const [comment, setComment] = useState('');

  const handleComment = async () => {
    if (comment.trim()) {
      await onComment(comment);
      setComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await onDeleteComment(commentId);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <CommentIcon className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogDescription className=" flex flex-col gap-2 p-3">
          <div className="flex flex-row gap-3 pl-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="comment">write a comment</Label>
              <Textarea
                onChange={e => setComment(e.target.value)}
                id="comment"
                value={comment}
                rows={3}
                className=" resize-none"
              />
            </div>

            <Button className="relative top-4" onClick={handleComment}>
              Comment
            </Button>
          </div>

          <div className=" flex flex-col gap-4 h-60 pr-3 overflow-y-scroll">
            {comments?.map((comment, index) => (
              <div
                key={index}
                className="flex flex-row bg-slate-200  rounded-md gap-3 p-2"
              >
                <Link to={`/${comment.userName}`}>
                  <DialogClose>
                    <Avatar>
                      <AvatarImage
                        src={`https://nazmul.sirv.com/facebook/${comment.userName}.png`}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DialogClose>
                </Link>

                <div className="w-[75%] flex flex-col gap-1">
                  <p className=" font-bold text-black">{comment.userName}</p>
                  <p className=" text-black">{comment.comment}</p>
                </div>
                {comment.userName === currentUserName && (
                  <DeleteIcon
                    onClick={() => handleDeleteComment(comment._id)}
                    className=" cursor-pointer"
                    fontSize="small"
                  />
                )}
              </div>
            ))}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
