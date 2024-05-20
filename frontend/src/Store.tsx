import { PropsWithChildren, createContext, useReducer } from 'react';
import { AppState } from './Types/types';

const initialState: AppState = {
  userInfo: null,
};

const reducer = (state: AppState, action) => {};

const Store = createContext({
  state: initialState,
  dispatch: () => undefined,
});

function StoreProvider(props: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Store.Provider value={{ state, dispatch }} {...props} />;
}

export { Store, StoreProvider };
