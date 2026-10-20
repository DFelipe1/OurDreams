export type Pessoa = { id: string; name: string };

export type Item = {
  id: string;
  title: string;
  status_Item: "ideia" | "emAndamento" | "realizado";
  category: "sonho" | "meta" | "conquista";
  pessoas: Pessoa[];
};

export const CATEGORIAS = ["sonho", "meta", "conquista"] as const;
export const STATUS = ["ideia", "emAndamento", "realizado"] as const;
export const SCOPE = ["individual", "casal"] as const;