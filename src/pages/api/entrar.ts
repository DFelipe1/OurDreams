import type { APIRoute } from "astro";
import { hygraph } from "../../lib/hygraph";
import { COOKIE_NAME, createSession } from "../../lib/session";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const senha = form.get("senha");
  const pessoaId = form.get("pessoa");

  if (senha !== import.meta.env.SITE_PASSWORD || typeof pessoaId !== "string") {
    return redirect("/entrar?erro=1");
  }

  // garante que o id escolhido é de uma pessoa que existe de verdade
  const { pessoas } = await hygraph<{ pessoas: { id: string }[] }>(
    `query { pessoas { id } }`
  );
  if (!pessoas.some((p) => p.id === pessoaId)) {
    return redirect("/entrar?erro=1");
  }

  cookies.set(COOKIE_NAME, await createSession(pessoaId), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  return redirect("/");
};