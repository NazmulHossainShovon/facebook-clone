import React, { createContext, useContext, useMemo } from "react";
import { AutoFlagClient } from "./AutoFlagClient";

type FlagpilotContextType = {
  client: AutoFlagClient;
  trackGoal: (eventName: string) => Promise<void>;
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
