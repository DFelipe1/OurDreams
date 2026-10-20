async function request<T>(
  endpoint: string,
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  
  if (!res.ok || json?.errors) {
    const detail =
      json?.errors?.map((e: { message: string }) => e.message).join("; ") ??
      `sem detalhes`;
    throw new Error(`Hygraph (${res.status}): ${detail}`);
  }

  return json.data as T;
}

export function hygraph<T>(query: string, variables: Record<string, unknown> = {}) {
  return request<T>(
    import.meta.env.HYGRAPH_ENDPOINT,
    import.meta.env.HYGRAPH_READ_TOKEN,
    query,
    variables
  );
}

export function hygraphWrite<T>(query: string, variables: Record<string, unknown> = {}) {
  return request<T>(
    import.meta.env.HYGRAPH_ENDPOINT,
    import.meta.env.HYGRAPH_READ_TOKEN,
    query,
    variables
  );
}