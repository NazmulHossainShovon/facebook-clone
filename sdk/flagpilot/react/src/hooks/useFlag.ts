import { useCallback, useEffect, useState } from "react";
import { useFlagpilotContext } from "../FlagpilotProvider";
import type { EvaluateOptions, TrackGoalOptions, UseFlagResult, UserAttributes } from "../types";

export function useFlag<T = unknown>(
  flagKey: string,
  goalEvent: string,
  defaultValue: T,
  options?: EvaluateOptions
): UseFlagResult<T> {
  const { client } = useFlagpilotContext();
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  const fetchValue = useCallback(async () => {
    setIsLoading(true);
    const nextValue = await client.getValue(flagKey, goalEvent, defaultValue, options);
    setValue(nextValue);
    setIsLoading(false);
  }, [client, defaultValue, flagKey, goalEvent, JSON.stringify(options?.attributes)]);

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

export function useFlagpilot() {
  const { client, trackGoal, identify, setAttributes, resetIdentity } = useFlagpilotContext();
  return {
    client,
    trackGoal,
    identify,
    setAttributes,
    resetIdentity,
  };
}
