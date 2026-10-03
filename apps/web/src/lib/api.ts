export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.message ?? "Request failed"), { code: data.code, status: res.status });
  }
  return data as T;
}
