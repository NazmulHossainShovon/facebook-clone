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

export { User, AppState, SignupData };
