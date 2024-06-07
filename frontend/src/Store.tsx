import { PropsWithChildren, createContext, useReducer } from 'react';
import { AppState, User } from './Types/types';

const initialState: AppState = {
  userInfo: null,
};

type Action = { type: 'sign-in'; payload: User };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'sign-in':
      return { ...state, userInfo: action.payload };
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
