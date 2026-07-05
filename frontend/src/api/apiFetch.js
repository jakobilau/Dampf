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
    throw new Error(data?.message || "Request failed");
  }

  return data;
}