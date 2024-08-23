type User = {
  name: string;
  email: string;
  friends: string[];
  receivedFriendReqs: string[];
  sentFriendReqs: string[];
  token: string;
};

type People = {
  name: string;
  image: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
  image: FileList;
};

type AppState = {
  userInfo: User;
  searchQuery: string;
};

type Post = {
  post: string;
  authorName: string;
  authorImage: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  likers: string[];
  _id: string;
};

export { User, AppState, SignupData, Post, People };
