export type FlagValue = string | null;

export type FlagData = {
  enabled: boolean;
  value?: FlagValue;
};

export type FlagsMap = Record<string, FlagData>;
