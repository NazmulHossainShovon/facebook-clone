import type { AutoFlagClientConfig, EvaluateResponse, UserIdentifyInput } from "./types";

export class AutoFlagClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private anonUserId: string | null;
  private userId: string | null;

  constructor({ apiKey, baseUrl = "http://localhost:4000/api/flagpilot/v1" }: AutoFlagClientConfig) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.anonUserId = this.getOrInitAnonId();
    this.userId = this.getExistingUserId();
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

  async identify(user: UserIdentifyInput): Promise<void> {
    const targetUserId = typeof user === "string" ? user.trim() : (user?.id || "").trim();
    if (!targetUserId) return;

    this.userId = targetUserId;
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("af_user_id", targetUserId);
    }

    try {
      await fetch(`${this.baseUrl}/identify`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({
          anonymousId: this.anonUserId,
          userId: targetUserId,
        }),
      });
    } catch {
      // no-op by design for SDK ergonomics
    }
  }

  resetIdentity(): void {
    this.userId = null;
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("af_user_id");
    }
  }

  async getValue<T = unknown>(flagKey: string, goalEvent: string, defaultValue: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}/evaluate`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({
          flagKey,
          goalEvent,
          userId: this.userId || undefined,
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

  async trackGoal(eventName: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/track`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({
          eventName,
          userId: this.userId || undefined,
        }),
      });
    } catch {
      // no-op by design for SDK ergonomics
    }
  }
}
