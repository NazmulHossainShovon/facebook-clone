import { useMemo } from "react";
import { useFlagpilotContext } from "../FlagpilotProvider";

export function useFlag(key: string) {
  const { flags } = useFlagpilotContext();

  return useMemo(() => {
    const entry = flags[key];
    if (!entry) return { enabled: false, value: undefined };
    return { enabled: !!entry.enabled, value: entry.value };
  }, [flags, key]);
}

export function useFlags() {
  const { flags, isLoading, refetch } = useFlagpilotContext();
  return { flags, isLoading, refetch };
}
