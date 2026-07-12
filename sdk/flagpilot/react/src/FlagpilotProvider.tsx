import React, { createContext, useContext, useEffect, useState } from "react";
import type { FlagsMap } from "./types";

type FlagpilotContextType = {
  flags: FlagsMap;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const FlagpilotContext = createContext<FlagpilotContextType | null>(null);

export function FlagpilotProvider({
  children,
  environmentKey,
  apiUrl,
}: {
  children: React.ReactNode;
  environmentKey: string;
  apiUrl?: string; // optional base URL, defaults to http://localhost:4000
}) {
  const [flags, setFlags] = useState<FlagsMap>({});
  const [isLoading, setIsLoading] = useState(false);

  const envUrl = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || (globalThis as any)?.NEXT_PUBLIC_API_URL;
  const base = apiUrl || envUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:4000");

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(base + "/api/flagpilot/public/flags", {
        headers: { "X-Environment-Key": environmentKey },
      });
      if (!res.ok) throw new Error("Failed to fetch flags");
      const data = await res.json();
      setFlags(data || {});
    } catch (err) {
      setFlags({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!environmentKey) return;
    fetchFlags();
    // intentionally no envKey in deps to avoid refetch loops; user can call refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlagpilotContext.Provider value={{ flags, isLoading, refetch: fetchFlags }}>
      {children}
    </FlagpilotContext.Provider>
  );
}

export function useFlagpilotContext() {
  const ctx = useContext(FlagpilotContext);
  if (!ctx) throw new Error("useFlagpilotContext must be used within FlagpilotProvider");
  return ctx;
}
