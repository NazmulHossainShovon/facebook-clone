import type {
  AutoFlagClientConfig,
  EvaluateOptions,
  EvaluateResponse,
  TrackGoalOptions,
  UserAttributes,
  UserIdentifyInput,
} from "./types";

export class AutoFlagClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultAttributes: UserAttributes;
  private userAttributes: UserAttributes;
  private anonUserId: string | null;
  private userId: string | null;

  constructor({
    apiKey,
    baseUrl = "http://localhost:4000/api/flagpilot/v1",
    defaultAttributes = {},
  }: AutoFlagClientConfig) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultAttributes = defaultAttributes;
    this.anonUserId = this.getOrInitAnonId();
    this.userId = this.getExistingUserId();
    this.userAttributes = this.getExistingUserAttributes();
  }

  private getOrInitAnonId(): string | null {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    const existing = window.localStorage.getItem("af_anon_id");
    if (existing) {
      return existing;
    }

    const generated = `anon_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem("af_anon_id", generated);
    return generated;
  }

  private getExistingUserId(): string | null {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem("af_user_id");
  }

  private getExistingUserAttributes(): UserAttributes {
    if (typeof window === "undefined" || !window.localStorage) {
      return {};
    }
    try {
      const stored = window.localStorage.getItem("af_user_attributes");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private baseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };

    if (this.anonUserId) {
      headers["x-anon-user-id"] = this.anonUserId;
    }

    if (this.userId) {
      headers["x-user-id"] = this.userId;
    }

    return headers;
  }

  private getMergedAttributes(local?: UserAttributes): UserAttributes {
    return {
      ...this.defaultAttributes,
      ...this.userAttributes,
      ...(local || {}),
    };
  }

  async identify(user: UserIdentifyInput, attributes?: UserAttributes): Promise<void> {
    const targetUserId = typeof user === "string" ? user.trim() : (user?.id || "").trim();
    if (!targetUserId) return;

    this.userId = targetUserId;
    if (attributes && typeof attributes === "object") {
      this.userAttributes = { ...this.userAttributes, ...attributes };
    }

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("af_user_id", targetUserId);
      window.localStorage.setItem("af_user_attributes", JSON.stringify(this.userAttributes));
    }

    try {
      const merged = this.getMergedAttributes(attributes);
      await fetch(`${this.baseUrl}/identify`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({
          anonymousId: this.anonUserId,
          userId: targetUserId,
          attributes: Object.keys(merged).length > 0 ? merged : undefined,
        }),
      });
    } catch {
      // no-op by design for SDK ergonomics
    }
  }

  setAttributes(attributes: UserAttributes): void {
    if (!attributes || typeof attributes !== "object") return;
    this.userAttributes = { ...this.userAttributes, ...attributes };
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("af_user_attributes", JSON.stringify(this.userAttributes));
    }
  }

  resetIdentity(): void {
    this.userId = null;
    this.userAttributes = {};
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("af_user_id");
      window.localStorage.removeItem("af_user_attributes");
    }
  }

  async getValue<T = unknown>(
    flagKey: string,
    goalEvent: string,
    defaultValue: T,
    options?: EvaluateOptions
  ): Promise<T> {
    try {
      const merged = this.getMergedAttributes(options?.attributes);
      const res = await fetch(`${this.baseUrl}/evaluate`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({
          flagKey,
          goalEvent,
          userId: this.userId || undefined,
          attributes: Object.keys(merged).length > 0 ? merged : undefined,
        }),
      });

      if (!res.ok) {
        return defaultValue;
      }

      const data = (await res.json()) as EvaluateResponse;

      if (data.anonUserId && !this.anonUserId) {
        this.anonUserId = data.anonUserId;
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("af_anon_id", data.anonUserId);
        }
      }

      return (data.value as T) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async trackGoal(eventName: string, options?: TrackGoalOptions): Promise<void> {
    try {
      const merged = this.getMergedAttributes(options?.attributes);
      await fetch(`${this.baseUrl}/track`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({
          eventName,
          userId: this.userId || undefined,
          eventId: options?.eventId,
          attributes: Object.keys(merged).length > 0 ? merged : undefined,
        }),
      });
    } catch {
      // no-op by design for SDK ergonomics
    }
  }
}
