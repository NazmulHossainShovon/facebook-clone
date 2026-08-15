export type AutoFlagClientConfig = {
  apiKey: string;
  baseUrl?: string;
};

export type EvaluateResponse = {
  variant: string;
  value: unknown;
  anonUserId?: string;
};

export type UseFlagResult<T> = {
  value: T;
  isLoading: boolean;
  refetch: () => Promise<void>;
};
