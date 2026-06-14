jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../app/login/page';
import { Store } from '@/lib/store';
import * as userHooks from '@/hooks/user-hooks';
import * as nextNav from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('Login integration', () => {
  const dispatchMock = jest.fn();
  const defaultState = { state: { userInfo: {} }, dispatch: dispatchMock } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    // default router mock
    (nextNav.useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    // default toast mock
    const { useToast } = require('@/hooks/use-toast');
    useToast.mockReturnValue({ toast: jest.fn(), toasts: [] });
  });

  test('renders inputs and buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Store.Provider value={defaultState}>
          <Login />
        </Store.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
  });

  test('successful signin calls mutate, dispatch and redirects', async () => {
    const mutateAsync = jest.fn().mockResolvedValue({ user: { name: 'Test' }, token: 'tok' });
    jest.spyOn(userHooks, 'useSigninMutation' as any).mockReturnValue({ mutateAsync, isPending: false });

    const push = jest.fn();
    jest.spyOn(nextNav, 'useRouter' as any).mockReturnValue({ push });

    render(
      <QueryClientProvider client={queryClient}>
        <Store.Provider value={defaultState}>
          <Login />
        </Store.Provider>
      </QueryClientProvider>
    );

    userEvent.type(screen.getByPlaceholderText(/Email address/i), 'me@example.com');
    userEvent.type(screen.getByPlaceholderText(/Password/i), 'pass');

    userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(dispatchMock).toHaveBeenCalled());
    expect(localStorage.getItem('user-token')).toBe('tok');
    expect(push).toHaveBeenCalled();
  });

  test('failed signin shows toast with server message', async () => {
    const error = { response: { data: { message: 'Invalid credentials' } } };
    const mutateAsync = jest.fn().mockRejectedValue(error);
    jest.spyOn(userHooks, 'useSigninMutation' as any).mockReturnValue({ mutateAsync, isPending: false });

    const toast = jest.fn();
    const { useToast } = require('@/hooks/use-toast');
    useToast.mockReturnValue({ toast, toasts: [] });

    render(
      <QueryClientProvider client={queryClient}>
        <Store.Provider value={defaultState}>
          <Login />
        </Store.Provider>
      </QueryClientProvider>
    );

    userEvent.type(screen.getByPlaceholderText(/Email address/i), 'me@example.com');
    userEvent.type(screen.getByPlaceholderText(/Password/i), 'badpass');
    userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Invalid credentials' })));
  });

  test('google button sets window.location.href to auth endpoint', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Store.Provider value={defaultState}>
          <Login />
        </Store.Provider>
      </QueryClientProvider>
    );

    // mock location href setter to capture assigned url
    let assignedHref = '';
    delete (window as any).location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: {
        get href() {
          return assignedHref;
        },
        set href(val: string) {
          assignedHref = val;
        },
      },
    });

    const googleBtn = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(googleBtn);

    expect(assignedHref).toMatch(/api\/users\/auth\/google/);
  });
});
