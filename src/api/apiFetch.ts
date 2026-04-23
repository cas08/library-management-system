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

export function resolveAssetUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${API}${url}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
    const token = getToken();
    const isFormData = options?.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string> | undefined),
    };

    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API}${path}`, {...options, headers});
    const text = await res.text();
    try {
        return {ok: res.ok, status: res.status, data: JSON.parse(text)};
    } catch {
        return {ok: res.ok, status: res.status, data: text};
    }
}
