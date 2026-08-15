import { useCallback, useEffect, useState } from "react";
import { useFlagpilotContext } from "../FlagpilotProvider";
import type { UseFlagResult } from "../types";

export function useFlag<T = unknown>(
  flagKey: string,
  goalEvent: string,
  defaultValue: T
): UseFlagResult<T> {
  const { client } = useFlagpilotContext();
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  const fetchValue = useCallback(async () => {
    setIsLoading(true);
    const nextValue = await client.getValue(flagKey, goalEvent, defaultValue);
    setValue(nextValue);
    setIsLoading(false);
  }, [client, defaultValue, flagKey, goalEvent]);

  useEffect(() => {
    fetchValue();
  }, [fetchValue]);

  return {
    value,
    isLoading,
    refetch: fetchValue,
  };
}

export function useTrackGoal() {
  const { trackGoal } = useFlagpilotContext();
  return trackGoal;
}
