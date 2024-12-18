import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Post } from '../Types/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';

function UserProfile() {
  const navigate = useNavigate();
  const { userName } = useParams();
  const [post, setPost] = useState('');
  const {
    state: { userInfo },
    dispatch,
  } = useContext(Store);
  const { mutateAsync: createPost } = useCreatePost();
  const { data: userData, refetch: refetchUser } = useGetUserInfo(userName);
  const { data, refetch } = useGetPosts(userName);
  const { mutateAsync: sendRequest } = useSendFriendRequest();
  const { mutateAsync: cancelRequest } = useCancelFriendRequest();
  const { mutateAsync: acceptRequest } = useAcceptFriendRequest();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const isLoggedInUser = userInfo.name === userName;

  const handlePost = async () => {
    const res = await createPost({ post });
    await refetch();
  };

  const sendFriendRequest = async () => {
    const updatedUser = await sendRequest({
      sender: userInfo.name,
      receiver: userName,
    });
    dispatch({ type: 'sign-in', payload: updatedUser });
    await refetchUser();
  };

  const handleCancelRequest = async () => {
    const res = await cancelRequest({
      sender: userInfo.name,
      receiver: userName,
    });
    dispatch({ type: 'sign-in', payload: res.sender });
    await refetchUser();
  };

  const handleReject = async () => {
    const res = await cancelRequest({
      sender: userName,
      receiver: userInfo.name,
    });
    dispatch({ type: 'sign-in', payload: res.receiver });
    await refetchUser();
  };

  const handleAcceptRequest = async () => {
    const updatedUser = await acceptRequest({
      sender: userName,
      receiver: userInfo.name,
    });
    dispatch({ type: 'sign-in', payload: updatedUser });
    await refetchUser();
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setAllPosts(prevPosts =>
      prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user-info');
    if (!userJson) {
      navigate('/signup');
    }
  }, [navigate]);

  useEffect(() => {
    if (data) {
      setAllPosts(data);
    }
  }, [data]);

  return (
    <div className=" pt-[60px] flex flex-col gap-3 items-center align-middle bg-[#F0F2F5] h-screen">
      <div className="flex flex-col gap-3 bg-white rounded-lg w-[90%] md:w-[30%] p-3 border border-gray-200 shadow">
        <Avatar className=" w-20 h-20 ">
          <AvatarImage
            src={`https://nazmul.sirv.com/facebook/${userName}.png`}
            className=" object-cover"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h2>{userData?.name}</h2>
        {!isLoggedInUser && (
          <>
            {userData?.receivedFriendReqs.includes(userInfo.name) ? (
              <Button onClick={handleCancelRequest}>Cancel Request</Button>
            ) : userData?.sentFriendReqs.includes(userInfo.name) ? (
              <div className="flex flex-row gap-3">
                <Button onClick={handleAcceptRequest}>Accept Request</Button>
                <Button onClick={handleReject}>Reject</Button>
              </div>
            ) : userData?.friends.includes(userInfo.name) ? (
              <FriendOptionsMenu tempUser={userName} refetch={refetchUser} />
            ) : (
              <Button onClick={sendFriendRequest}>Send Request </Button>
            )}
          </>
        )}
      </div>

      <Dialog>
        <DialogTrigger>
          {isLoggedInUser && <Button>Whats on your mind?</Button>}
        </DialogTrigger>
        <DialogContent>
          <DialogDescription className="flex flex-col gap-3 p-3">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Create Post</Label>
              <Textarea
                onChange={e => setPost(e.target.value)}
                id="message"
                rows={10}
                className=" resize-none"
              />
            </div>
            <Button onClick={handlePost}>Post</Button>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {allPosts.map((post, index) => (
        <PostCard
          key={index}
          text={post.post}
          authorName={post.authorName}
          createdAt={post.createdAt}
          id={post._id}
          refetch={refetch}
          likers={post.likers}
          isLoggedInUser={isLoggedInUser}
          onPostUpdate={handlePostUpdate}
          comments={post.comments}
        />
      ))}
    </div>
  );
}

export default UserProfile;
