import { PropsWithChildren, createContext, useReducer } from 'react';
import { AppState, User } from './Types/types';
import { io } from 'socket.io-client';

const initialState: AppState = {
  userInfo: null,
};

const socket = io('http://localhost:4000');

type Action = { type: 'sign-in'; payload: User } | { type: 'sign-out' };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'sign-in':
      socket.emit('storeUser', action.payload.name);
      localStorage.setItem('user-info', JSON.stringify(action.payload));
      return { ...state, userInfo: action.payload };
    case 'sign-out':
      return { ...state, userInfo: null };
    default:
      return state;
  }
};

const defaultDispatch: React.Dispatch<Action> = () => initialState;

const Store = createContext({
  state: initialState,
  dispatch: defaultDispatch,
});

function StoreProvider(props: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Store.Provider value={{ state, dispatch }} {...props} />;
}

export { Store, StoreProvider };
