import React, { createContext, useContext, useMemo } from "react";
import { AutoFlagClient } from "./AutoFlagClient";
import type { UserIdentifyInput } from "./types";

type FlagpilotContextType = {
  client: AutoFlagClient;
  trackGoal: (eventName: string) => Promise<void>;
  identify: (user: UserIdentifyInput) => Promise<void>;
  resetIdentity: () => void;
};

const FlagpilotContext = createContext<FlagpilotContextType | null>(null);

export function FlagpilotProvider({
  children,
  apiKey,
  baseUrl,
}: {
  children: React.ReactNode;
  apiKey: string;
  baseUrl?: string;
}) {
  const client = useMemo(() => new AutoFlagClient({ apiKey, baseUrl }), [apiKey, baseUrl]);

  const value = useMemo(
    () => ({
      client,
      trackGoal: async (eventName: string) => client.trackGoal(eventName),
      identify: async (user: UserIdentifyInput) => client.identify(user),
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
