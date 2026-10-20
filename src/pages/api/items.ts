import type { APIRoute } from "astro";
import { hygraph, hygraphWrite } from "../../lib/hygraph";
import { CATEGORIAS, STATUS, SCOPE } from "../../lib/types";

export const prerender = false;

const CREATE_ITEM = `
  mutation CreateItem($data: ItemCreateInput!) {
    createItem(data: $data) { id }
  }
`;

const PUBLISH_ITEM = `
  mutation PublishItem($id: ID!) {
    publishItem(where: { id: $id }, to: PUBLISHED) { id }
  }
`;

export const POST: APIRoute = async ({ request, locals, redirect, cookies }) => {
  const meuId = locals.pessoaId;
  if (!meuId) return new Response("Não autorizado", { status: 401 });

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const status = String(form.get("status") ?? "");
  const escopo = String(form.get("escopo") ?? "");

  console.log({ title, category, status, escopo });

  const valido =
    title.length > 0 &&
    title.length <= 120 &&
    (CATEGORIAS as readonly string[]).includes(category) &&
    (STATUS as readonly string[]).includes(status) &&
    (SCOPE as readonly string[]).includes(escopo);

  if (!valido) return redirect("/novo?erro=1");

  try {
    // quem participa é decidido pelo servidor, não pelo formulário
    const { pessoas } = await hygraph<{ pessoas: { id: string; name: string }[] }>(
      `query { pessoas { id name } }`
    );
    const ids = escopo === "casal" ? pessoas.map((p) => p.id) : [meuId];

    const { createItem } = await hygraphWrite<{ createItem: { id: string } }>(
      CREATE_ITEM,
      {
        data: {
          title,
          category,
          status_Item: status,
          scope: escopo,
          pessoas: { connect: ids.map((id) => ({ id })) },
        },
      }
    );

    await hygraphWrite(PUBLISH_ITEM, { id: createItem.id });

    cookies.set(
    "recente",
    JSON.stringify({
      id: createItem.id,
      title,
      category,
      status_Item: status,
      pessoas: pessoas.filter((p) => ids.includes(p.id)),
    }),
    {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60, // some sozinho em 1 minuto
    }
  );

  } catch (error) {
    console.error("Erro ao criar item:", error);
    return redirect("/novo?erro=1");
  }

  return redirect("/");
};