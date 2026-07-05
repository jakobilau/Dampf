export async function apiFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  const contentType = res.headers.get("content-type");

  let data;

  try {
    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch {
    data = null;
  }

  if (!res.ok) {
     console.error("API ERROR:", res.status, data);
  throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}