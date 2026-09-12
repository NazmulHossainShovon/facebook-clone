import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CopyKeyButton from "../../../components/flagpilot/CopyKeyButton";

describe("CopyKeyButton Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders copy button initially", () => {
    render(<CopyKeyButton apiKey="fp_proj_test_123" />);
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  test("copies API key to clipboard and changes state to Copied, then reverts after timeout", async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CopyKeyButton apiKey="fp_proj_test_123" />);
    const button = screen.getByRole("button", { name: "Copy" });

    fireEvent.click(button);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("fp_proj_test_123");
      expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    });

    // Advance timers by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });
  });

  test("handles clipboard failure gracefully", async () => {
    const writeTextMock = jest.fn().mockRejectedValue(new Error("Clipboard write denied"));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CopyKeyButton apiKey="fp_proj_test_123" />);
    const button = screen.getByRole("button", { name: "Copy" });

    fireEvent.click(button);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("fp_proj_test_123");
    });
    // Button stays as Copy if copying failed
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });
});
