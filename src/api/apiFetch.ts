export const API = "http://localhost:3000";

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, options);
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}
