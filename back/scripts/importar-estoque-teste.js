import prisma from "../src/database/client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

// ============================================================================
// Importa apenas ALGUNS itens do estoque (subconjunto) para TESTE do cruzamento
// kit x estoque (variantes por gênero/tamanho). NÃO apaga nada e NÃO importa os
// outros CSVs. Itens com mesmo nome+tamanho já existentes são pulados.
//
//   npm run importar-estoque-teste
// ============================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Grupos com variantes de gênero e/ou tamanho — bons para testar o casamento.
// Foco: "CAMISA PRETA" do kit (ADMIN/BAZAR/...) casando com a versão real do
// estoque que tem gênero (CAMISA SOCIAL FEMININA/MASCULINA PRETA) e a unissex.
const PALAVRAS = ["CAMISA SOCIAL", "CAMISA MALHA PRETA", "CAMISA MALHA BRANCA"];
const LIMITE = 120;

async function main() {
  const txt = fs.readFileSync(path.join(__dirname, "dados", "estoque.csv"), "utf8").replace(/^﻿/, "");
  const linhas = Papa.parse(txt, { header: true, delimiter: ";", skipEmptyLines: true }).data;

  const selecionados = linhas
    .filter((r) => (r.NOME || "").trim())
    .filter((r) => PALAVRAS.some((p) => r.NOME.toUpperCase().includes(p)))
    .slice(0, LIMITE);

  let criados = 0, pulados = 0;
  for (const r of selecionados) {
    const name = r.NOME.trim().toUpperCase();
    const size = (r.TAMANHO || "").trim() || null;
    const existe = await prisma.item.findFirst({ where: { name, size } });
    if (existe) { pulados++; continue; }

    const q = parseInt(r.QUANTIDADE) || 0;
    await prisma.item.create({
      data: {
        name,
        quantity: q > 0 ? q : 50, // garante estoque positivo para testar entrega
        type: (r.TIPO || "").trim() || "OUTRO",
        sector: (r.SETOR || "").trim() || "GERAL",
        size,
        ean: (r.EAN || "").trim() || null,
      },
    });
    criados++;
  }

  console.log(`\n✅ Itens de teste importados: ${criados} criados, ${pulados} já existiam.`);
  const amostra = await prisma.item.findMany({
    where: { name: { contains: "SOCIAL" } },
    take: 10,
    orderBy: { name: "asc" },
    select: { name: true, size: true, quantity: true },
  });
  if (amostra.length) {
    console.log("\nExemplos (variantes de gênero/tamanho):");
    amostra.forEach((i) => console.log(`  - ${i.name} | tam ${i.size || "-"} | estoque ${i.quantity}`));
  }
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error("❌ Erro:", e.message); await prisma.$disconnect(); process.exit(1); });
