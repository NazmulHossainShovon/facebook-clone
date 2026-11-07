import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import {
  AutoFlagClient,
  FlagpilotProvider,
  useFlag,
  useFlagpilot,
  useTrackGoal,
} from "flagpilot-react";

describe("Flagpilot React SDK Core Features", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    global.fetch = jest.fn();
  });

  describe("AutoFlagClient Core", () => {
    test("initializes anonymous ID, evaluates flag, and persists ID to localStorage", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          variant: "dark_theme",
          value: { bg: "#000" },
          anonUserId: "anon_test_user_abc",
        }),
      });

      const client = new AutoFlagClient({ apiKey: "fp_proj_core_test" });
      const val = await client.getValue("theme_flag", "theme_viewed", { bg: "#fff" });

      expect(val).toEqual({ bg: "#000" });
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/api/flagpilot/v1/evaluate",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-api-key": "fp_proj_core_test",
          }),
          body: JSON.stringify({
            flagKey: "theme_flag",
            goalEvent: "theme_viewed",
          }),
        })
      );
      expect(window.localStorage.getItem("af_anon_id")).toBeTruthy();
    });

    test("falls back gracefully to defaultValue if network request fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network offline"));

      const client = new AutoFlagClient({ apiKey: "fp_proj_core_test" });
      const val = await client.getValue("broken_flag", "goal", "fallback_value");

      expect(val).toBe("fallback_value");
    });

    test("handles identify and resetIdentity lifecycle", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success" }),
      });

      const client = new AutoFlagClient({
        apiKey: "fp_proj_core_test",
        defaultAttributes: { platform: "web" },
      });

      // 1. Identify user with account attributes
      await client.identify("user_vip_999", { plan: "pro" });

      expect(window.localStorage.getItem("af_user_id")).toBe("user_vip_999");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/api/flagpilot/v1/identify",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-user-id": "user_vip_999",
          }),
          body: expect.stringContaining('"plan":"pro"'),
        })
      );

      // 2. Reset identity (logout)
      client.resetIdentity();
      expect(window.localStorage.getItem("af_user_id")).toBeNull();
      // Anonymous ID should still be preserved
      expect(window.localStorage.getItem("af_anon_id")).toBeTruthy();
    });

    test("tracks goal with eventId and contextual attributes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "queued" }),
      });

      const client = new AutoFlagClient({ apiKey: "fp_proj_core_test" });
      await client.trackGoal("purchase", {
        eventId: "evt_order_123",
        attributes: { source: "google_ads", cart_total: 150 },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/api/flagpilot/v1/track",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            eventName: "purchase",
            eventId: "evt_order_123",
            attributes: { source: "google_ads", cart_total: 150 },
          }),
        })
      );
    });
  });

  describe("React Hooks & Provider Integration", () => {
    function TestComponent() {
      const { value, isLoading } = useFlag("button_text_flag", "clicked", "Click Me");
      if (isLoading) return <div>Loading...</div>;
      return <button>{value}</button>;
    }

    test("useFlag renders evaluated value inside FlagpilotProvider", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          variant: "variant_b",
          value: "Get Started Now!",
          anonUserId: "anon_test_user_1",
        }),
      });

      render(
        <FlagpilotProvider apiKey="fp_proj_test">
          <TestComponent />
        </FlagpilotProvider>
      );

      // Initially shows fallback or evaluated value once fetched
      expect(await screen.findByRole("button", { name: "Get Started Now!" })).toBeInTheDocument();
    });

    test("throws meaningful error when hook is rendered outside FlagpilotProvider", () => {
      // Suppress console.error output for the intentional boundary error
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        "useFlagpilotContext must be used within FlagpilotProvider"
      );

      consoleSpy.mockRestore();
    });
  });
});
