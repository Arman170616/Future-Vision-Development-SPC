/** Client for the Django admin API (backend/adminapi). */

export const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API ?? 'https://api.futureinnvo.com/api/admin';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://futureinnvo.com';
export const BASE_PATH = '/admin';

const TOKEN_KEY = 'fi-admin-token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

export class ApiError extends Error {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;

  constructor(status: number, data: unknown) {
    const detail = (data as { detail?: string })?.detail;
    super(detail || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

type Options = {
  method?: string;
  json?: unknown;
  form?: FormData;
  query?: Record<string, string | number | undefined | null>;
  auth?: boolean;
};

export async function api<T>(path: string, { method, json, form, query, auth = true }: Options = {}): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (form) body = form;
  else if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  const response = await fetch(url, { method: method ?? (body ? 'POST' : 'GET'), headers, body });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && auth) {
    setToken(null);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith(`${BASE_PATH}/login`)) {
      const next = window.location.pathname + window.location.search;
      window.location.href = `${BASE_PATH}/login/?next=${encodeURIComponent(next)}`;
    }
  }
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}

/** Same-protocol absolute URL for media (the API may report http:// behind the cPanel proxy). */
export const mediaUrl = (url: string | null | undefined) => {
  if (!url) return '';
  return typeof window !== 'undefined' && window.location.protocol === 'https:' ? url.replace(/^http:\/\//, 'https://') : url;
};

// Models with a dedicated page instead of the generic changelist
const CUSTOM_LIST_PAGES: Record<string, string> = { 'tasks.task': '/tasks/', 'expenses.expense': '/expenses/', 'expenses.recurringexpense': '/expenses/#fixed', 'expenses.expenserequest': '/requests/' };

export const listHref = (model: string, params: Record<string, string> = {}) =>
  CUSTOM_LIST_PAGES[model] && !Object.keys(params).length
    ? CUSTOM_LIST_PAGES[model]
    : `/list/?${new URLSearchParams({ model, ...params }).toString()}`;

export const editHref = (model: string, id?: number | string | null) =>
  `/edit/?${new URLSearchParams(id === undefined || id === null ? { model } : { model, id: String(id) }).toString()}`;

/** Capitalize the first letter, like Django admin's |capfirst. */
export const capfirst = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

/** 1234.5 → "1,234.500" (Omani rial uses 3 decimals) */
export const formatMoney = (value: number | string, decimals = 3) =>
  Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const timeAgo = (iso: string) => {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  for (const [size, name] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};
