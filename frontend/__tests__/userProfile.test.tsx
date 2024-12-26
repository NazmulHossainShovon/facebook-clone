import * as userHooks from '../src/Hooks/userHook';
import * as postHooks from '../src/Hooks/postHooks';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import UserProfile from '../src/Pages/UserProfile';
import { Store } from '../src/Store';

jest.mock('../src/Hooks/userHook.ts');
jest.mock('../src/Hooks/postHooks.ts');

const mockDispatch = jest.fn();
const mockStoreValue = {
  state: {
    userInfo: {
      name: 'test',
      email: 'test',
      friends: [],
      receivedFriendReqs: [],
      sentFriendReqs: [],
      token: 'test',
    },
    searchQuery: '',
  },
  dispatch: mockDispatch,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    userName: 'test',
  }),
  useNavigate: () => jest.fn(),
}));

describe('UserProfile', () => {
  beforeEach(() => {
    (userHooks.useGetUserInfo as jest.Mock).mockReturnValue({
      data: {
        name: 'test',
        email: 'test',
        friends: [],
        receivedFriendReqs: [],
        sentFriendReqs: [],
        token: 'test',
      },
      refetch: jest.fn(),
    });

    (userHooks.useSendFriendRequest as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    (userHooks.useCancelFriendRequest as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    (userHooks.useAcceptFriendRequest as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    (postHooks.useCreatePost as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    (postHooks.useGetPosts as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });
  });

  it('should show "Whats on your mind?" button when user views their own profile', () => {
    render(
      <BrowserRouter>
        <Store.Provider value={mockStoreValue}>
          <UserProfile />
        </Store.Provider>
      </BrowserRouter>
    );

    const button = screen.getByText('Whats on your mind?');
    expect(button).toBeInTheDocument();
  });
});
