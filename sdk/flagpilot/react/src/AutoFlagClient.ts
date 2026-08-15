import type { AutoFlagClientConfig, EvaluateResponse } from "./types";

export class AutoFlagClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private anonUserId: string | null;

  constructor({ apiKey, baseUrl = "http://localhost:4000/api/flagpilot/v1" }: AutoFlagClientConfig) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.anonUserId = this.getOrInitAnonId();
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

  private baseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };

    if (this.anonUserId) {
      headers["x-anon-user-id"] = this.anonUserId;
    }

    return headers;
  }

  async getValue<T = unknown>(flagKey: string, goalEvent: string, defaultValue: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}/evaluate`, {
        method: "POST",
        headers: this.baseHeaders(),
        credentials: "include",
        body: JSON.stringify({ flagKey, goalEvent }),
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
        body: JSON.stringify({ eventName }),
      });
    } catch {
      // no-op by design for SDK ergonomics
    }
  }
}
