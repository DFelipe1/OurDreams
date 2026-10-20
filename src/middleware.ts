import { defineMiddleware } from "astro:middleware";
import { COOKIE_NAME, readSession } from "./lib/session";

const PUBLIC_PATHS = ["/entrar", "/api/entrar"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_astro")) {
    return next();
  }

  const pessoaId = await readSession(context.cookies.get(COOKIE_NAME)?.value);
  if (!pessoaId) return context.redirect("/entrar");

  context.locals.pessoaId = pessoaId;
  return next();
});