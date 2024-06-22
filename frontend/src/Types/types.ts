type User = {
  name: string;
  email: string;
  image: string;
  token: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
  image: FileList;
};

type AppState = {
  userInfo: User;
};

type Post = {
  post: string;
  authorName: string;
  authorImage: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  _id: string;
};

export { User, AppState, SignupData, Post };
