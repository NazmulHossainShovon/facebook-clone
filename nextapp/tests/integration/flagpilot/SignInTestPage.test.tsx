import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInTestPage from "../../../app/signin-test/page";

describe("SignInTestPage Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    global.fetch = jest.fn();
  });

  test("renders sign in form with default button text when evaluating flag", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        variant: "login",
        value: "Log In",
        anonUserId: "anon_test_123",
      }),
    });

    render(<SignInTestPage />);

    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();

    // After fetch evaluates, button text updates to evaluated value "Log In"
    expect(await screen.findByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  test("submits form, calls identify and triggers trackGoal conversion event", async () => {
    (global.fetch as jest.Mock)
      // 1. Fetch for evaluate
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          variant: "signin",
          value: "Sign In",
          anonUserId: "anon_test_123",
        }),
      })
      // 2. Fetch for identify
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success", mergedCount: 1 }),
      })
      // 3. Fetch for track
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "queued" }),
      });

    render(<SignInTestPage />);

    const emailInput = screen.getByPlaceholderText("user@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitBtn = await screen.findByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenLastCalledWith(
        "http://localhost:4000/api/flagpilot/v1/track",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(
        screen.getByText(/Identity merged & goal "signin_button_clicked" tracked/i)
      ).toBeInTheDocument();
    });
  });
});
