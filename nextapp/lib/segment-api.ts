const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type SegmentUser = {
  _id: string;
  name: string;
  email: string;
  apiKey: string;
  createdAt?: string;
};

export type SegmentDestinationType = 'google_sheets' | 'postgres';

export type SegmentDestination = {
  _id: string;
  userId: string;
  type: SegmentDestinationType;
  enabled: boolean;
  config: Record<string, unknown>;
  eventFilters: string[];
};

export type SegmentRawEvent = {
  _id: string;
  eventName: string;
  externalUserId?: string;
  properties?: Record<string, unknown>;
  ipAddress?: string;
  processed: boolean;
  createdAt: string;
};

const getToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return (
    localStorage.getItem('segment-token') ||
    localStorage.getItem('user-token') ||
    ''
  );
};

const withAuthHeaders = (headers?: HeadersInit): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { message?: string }).message || 'Request failed';
    throw new Error(message);
  }
  return response.json() as Promise<T>;
};

export const segmentRegister = async (payload: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_BASE}/api/segment/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ token: string; user: SegmentUser }>(response);
};

export const segmentLogin = async (payload: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_BASE}/api/segment/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ token: string; user: SegmentUser }>(response);
};

export const segmentMe = async () => {
  const response = await fetch(`${API_BASE}/api/segment/auth/me`, {
    method: 'GET',
    headers: withAuthHeaders(),
  });
  return parseResponse<{ user: SegmentUser }>(response);
};

export const segmentGetDestinations = async () => {
  const response = await fetch(`${API_BASE}/api/segment/destinations`, {
    method: 'GET',
    headers: withAuthHeaders(),
  });
  return parseResponse<SegmentDestination[]>(response);
};

export const segmentUpdateDestination = async (
  id: string,
  payload: {
    enabled?: boolean;
    config?: Record<string, unknown>;
    eventFilters?: string[];
  }
) => {
  const response = await fetch(`${API_BASE}/api/segment/destinations/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse<SegmentDestination>(response);
};

export const segmentRecentEvents = async () => {
  const response = await fetch(`${API_BASE}/api/segment/events/recent`, {
    method: 'GET',
    headers: withAuthHeaders(),
  });
  return parseResponse<SegmentRawEvent[]>(response);
};
