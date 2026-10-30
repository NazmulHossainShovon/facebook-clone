export type UserAttributes = Record<string, string | number | boolean | string[] | null | undefined>;

export type AutoFlagClientConfig = {
  apiKey: string;
  baseUrl?: string;
  defaultAttributes?: UserAttributes;
};

export type EvaluateResponse = {
  variant: string;
  value: unknown;
  anonUserId?: string;
  userId?: string;
};

export type UseFlagResult<T> = {
  value: T;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export type UserIdentifyInput = string | { id: string };

export type EvaluateOptions = {
  attributes?: UserAttributes;
};

export type TrackGoalOptions = {
  eventId?: string;
  attributes?: UserAttributes;
};
