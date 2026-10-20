const secret = import.meta.env.SESSION_SECRET;
const encoder = new TextEncoder();

export const COOKIE_NAME = "perfil";

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createSession(pessoaId: string): Promise<string> {
  return `${pessoaId}.${await sign(pessoaId)}`;
}

export async function readSession(cookie?: string): Promise<string | null> {
  if (!cookie) return null;
  const [pessoaId, signature] = cookie.split(".");
  if (!pessoaId || !signature) return null;
  return signature === (await sign(pessoaId)) ? pessoaId : null;
}