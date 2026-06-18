import prisma from "../src/database/client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function importarArmarios() {
  console.log("🗄️  Iniciando importação de armários...");

  const caminho = path.join(__dirname, "dados", "armarios.csv");
  const conteudo = fs.readFileSync(caminho, "latin1")
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "");
  const linhas = conteudo.split("\n").filter(l => l.trim());
  const dados = linhas.slice(1).map(linha => {
    const cols = linha.split(";");
    return {
      numero:    cols[0]?.trim(),
      tamanho:   cols[1]?.trim() || "",
      setor:     cols[2]?.trim() || "",
      situacao:  cols[3]?.trim() || "Disponivel",
      data:      cols[4]?.trim() || null,
      nome:      cols[5]?.trim() || null,
    };
  });

  let criados = 0, atualizados = 0, ignorados = 0, erros = 0;

  for (const row of dados) {
    const numero = parseInt(row.numero);
    if (!numero) { ignorados++; continue; }

    try {
      const existe = await prisma.cabinet.findUnique({ where: { number: numero } });

      if (existe) {
        // Atualiza com os dados mais recentes
        await prisma.cabinet.update({
          where: { number: numero },
          data: {
            size:      row.tamanho,
            sector:    row.setor,
            situation: row.situacao,
            date:      row.data ? new Date(row.data) : null,
            name:      row.nome || null,
          }
        });
        atualizados++;
      } else {
        await prisma.cabinet.create({
          data: {
            number:    numero,
            size:      row.tamanho,
            sector:    row.setor,
            situation: row.situacao,
            date:      row.data ? new Date(row.data) : null,
            name:      row.nome || null,
          }
        });
        criados++;
      }
    } catch (e) {
      console.error(`  ✗ Erro no armário ${numero}:`, e.message);
      erros++;
    }
  }

  console.log(`\n✅ Concluído!`);
  console.log(`   Criados:     ${criados}`);
  console.log(`   Atualizados: ${atualizados}`);
  console.log(`   Ignorados:   ${ignorados}`);
  console.log(`   Erros:       ${erros}`);

  await prisma.$disconnect();
}

importarArmarios().catch(async e => {
  console.error("❌ Erro fatal:", e);
  await prisma.$disconnect();
  process.exit(1);
});