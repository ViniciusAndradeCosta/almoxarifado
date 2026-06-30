// Busca pela ORDEM das letras digitadas a partir do INÍCIO do nome:
// o nome inteiro deve COMEÇAR com o texto buscado.
// Ex.: "LA" -> "LAURA VALAMIEL" (começa com LA); "VALA" -> NÃO traz
// "LAURA VALAMIEL" (o nome começa com LAURA, não com VALA).
export function matchPrefixo(nome: string | null | undefined, query: string): boolean {
  const q = (query || "").toLowerCase().trim();
  if (!q) return false;
  return (nome || "").toLowerCase().startsWith(q);
}
