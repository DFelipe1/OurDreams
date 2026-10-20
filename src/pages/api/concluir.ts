import type { APIRoute } from "astro";
import { hygraphWrite } from "../../lib/hygraph";

export const prerender = false;

const UPDATE_ITEM = `
  mutation UpdateItem($id: ID!, $data: ItemUpdateInput!) {
    updateItem(where: { id: $id }, data: $data) {
      id
      title
      category
      status_Item
      pessoas { id name }
    }
  }
`;

const PUBLISH_ITEM = `
  mutation PublishItem($id: ID!) {
    publishItem(where: { id: $id }, to: PUBLISHED) { id }
  }
`;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  if (!id) return redirect("/");

  try {
    const { updateItem } = await hygraphWrite<{
      updateItem: Record<string, unknown>;
    }>(UPDATE_ITEM, { id, data: { status_Item: "realizado" } });

    await hygraphWrite(PUBLISH_ITEM, { id });

    cookies.set("recente", JSON.stringify(updateItem), {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60,
    });
  } catch (error) {
    console.error("Erro ao concluir item:", error);
  }

  return redirect("/");
};