export type Pessoa = { id: string; name: string };

export type Item = {
  id: string;
  title: string;
  status_Item: "ideia" | "emAndamento" | "realizado";
  category: "sonho" | "meta" | "conquista";
  pessoas: Pessoa[];
};