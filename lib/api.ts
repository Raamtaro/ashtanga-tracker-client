import { getToken } from './auth';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

type UnauthorizedHandler = (info: { status: 401; path: string; message?: string }) => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler | null) {
    onUnauthorized = fn;
}

function buildUrl(path: string, query?: Record<string, unknown>) {
    const cleanPath = path.startsWith('/') ? path : `${path}`;
    const url = new URL(API_BASE + cleanPath);
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            url.searchParams.set(k, String(v));
        });
    }
    return url.toString();
}

async function parseJson<T>(res: Response): Promise<T> {
    const text = await res.text();
    if (!text) return {} as T;
    try {
        return JSON.parse(text) as T;
    } catch {
        // non-JSON body – return as text in a consistent envelope if needed
        return { raw: text } as unknown as T;
    }
}

async function request<T>(
    path: string,
    init: RequestInit = {},
    query?: Record<string, unknown>,
): Promise<T> {
    const token = await getToken();
    const url = buildUrl(path, query);

    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData)) {
        headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(url, { ...init, headers, credentials: 'omit' });

    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
            const errJson = await res.clone().json();
            msg = errJson?.error || errJson?.message || msg;
        } catch {
            msg = (await res.text()) || msg;
        }

        if (res.status === 401) {
            onUnauthorized?.({ status: 401, path: url, message: msg });
        }

        const e = new Error(msg) as Error & { status?: number };
        e.status = res.status;
        throw e;
    }

    const json = (await res.json()) as T;
    return json;
}

/** Public helpers */
export const api = {
    get: <T>(path: string, query?: Record<string, unknown>) => request<T>(path, { method: 'GET' }, query),
    post: <T>(path: string, body?: unknown, query?: Record<string, unknown>) =>
        request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }, query),
    put: <T>(path: string, body?: unknown, query?: Record<string, unknown>) =>
        request<T>(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }, query),
    patch: <T>(path: string, body?: unknown, query?: Record<string, unknown>) =>
        request<T>(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }, query),
    del: <T>(path: string, query?: Record<string, unknown>) => request<T>(path, { method: 'DELETE' }, query),
};

export async function authFetch(path: string, init: RequestInit = {}) {
    const token = await getToken();
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'omit' });
}

export async function login(email: string, password: string) {
    // Adjust to your actual /auth/login response { token }
    const res = await fetch(`${API_BASE}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { token }
}

export async function registerUser(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // decide what you return; you can auto-login after this
}

export async function getSessions(page = 1, limit = 20) {
    const res = await authFetch(`session?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function createSession() {

}

export async function editScoreCard(id: string) {

}

export async function deleteSession(id: string) {

}