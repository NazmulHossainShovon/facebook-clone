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

  test("submits form and triggers trackGoal conversion event", async () => {
    (global.fetch as jest.Mock)
      // First fetch for evaluate
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          variant: "signin",
          value: "Sign In",
          anonUserId: "anon_test_123",
        }),
      })
      // Second fetch for track
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
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        "http://localhost:4000/api/flagpilot/v1/track",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ eventName: "signin_button_clicked" }),
        })
      );
      expect(
        screen.getByText('Submitted! Goal "signin_button_clicked" tracked.')
      ).toBeInTheDocument();
    });
  });
});
