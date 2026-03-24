export const API = "http://localhost:3000";

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function setToken(token: string): void {
    localStorage.setItem("token", token);
}

export function clearToken(): void {
    localStorage.removeItem("token");
}

export async function apiFetch(path: string, options?: RequestInit) {
    const token = getToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options?.headers,
    };

    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API}${path}`, {...options, headers});
    const text = await res.text();
    try {
        return {ok: res.ok, status: res.status, data: JSON.parse(text)};
    } catch {
        return {ok: res.ok, status: res.status, data: text};
    }
}
