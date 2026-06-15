export async function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    credentials: "include", // 🔥 ABSOLUT NÖTIG
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}