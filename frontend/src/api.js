export const API_URL = "http://localhost:3001";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
