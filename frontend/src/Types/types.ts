type User = {
  name: string;
  email: string;
  token: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
};

type AppState = {
  userInfo: User;
};

export { User, AppState, SignupData };
