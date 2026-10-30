import React, { createContext, useContext, useMemo } from "react";
import { AutoFlagClient } from "./AutoFlagClient";
import type { UserIdentifyInput, TrackGoalOptions, UserAttributes } from "./types";

type FlagpilotContextType = {
  client: AutoFlagClient;
  trackGoal: (eventName: string, options?: TrackGoalOptions) => Promise<void>;
  identify: (user: UserIdentifyInput, attributes?: UserAttributes) => Promise<void>;
  setAttributes: (attributes: UserAttributes) => void;
  resetIdentity: () => void;
};

const FlagpilotContext = createContext<FlagpilotContextType | null>(null);

export function FlagpilotProvider({
  children,
  apiKey,
  baseUrl,
  defaultAttributes,
}: {
  children: React.ReactNode;
  apiKey: string;
  baseUrl?: string;
  defaultAttributes?: UserAttributes;
}) {
  const client = useMemo(
    () => new AutoFlagClient({ apiKey, baseUrl, defaultAttributes }),
    [apiKey, baseUrl, defaultAttributes]
  );

  const value = useMemo(
    () => ({
      client,
      trackGoal: async (eventName: string, options?: TrackGoalOptions) =>
        client.trackGoal(eventName, options),
      identify: async (user: UserIdentifyInput, attributes?: UserAttributes) =>
        client.identify(user, attributes),
      setAttributes: (attributes: UserAttributes) => client.setAttributes(attributes),
      resetIdentity: () => client.resetIdentity(),
    }),
    [client]
  );

  return <FlagpilotContext.Provider value={value}>{children}</FlagpilotContext.Provider>;
}

export function useFlagpilotContext() {
  const ctx = useContext(FlagpilotContext);
  if (!ctx) {
    throw new Error("useFlagpilotContext must be used within FlagpilotProvider");
  }
  return ctx;
}
