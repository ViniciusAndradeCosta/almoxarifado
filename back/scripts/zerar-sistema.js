import prisma from "../src/database/client.js";

// ============================================================================
// Zera o sistema: APAGA TODOS OS DADOS, EXCETO os usuários (login/senha).
// Operação IRREVERSÍVEL. Exige a flag --confirmar para executar.
//
//   npm run zerar -- --confirmar
// ============================================================================

const CONFIRMAR = process.argv.includes("--confirmar");

async function contar() {
  return {
    Usuarios: await prisma.user.count(),
    Funcionarios: await prisma.employee.count(),
    Itens: await prisma.item.count(),
    Armarios: await prisma.cabinet.count(),
    Saidas: await prisma.withdrawal.count(),
    Historico: await prisma.allWithdrawal.count(),
    Entradas: await prisma.stockEntry.count(),
    Pedidos: await prisma.order.count(),
    Descartes: await prisma.discardedItem.count(),
    Lavanderia: await prisma.laundryRecord.count(),
    NotasFiscais: await prisma.invoice.count(),
  };
}

async function main() {
  console.log("=== ANTES ===");
  console.table(await contar());

  if (!CONFIRMAR) {
    console.log("\n[SIMULAÇÃO] Nada foi apagado. Rode com '-- --confirmar' para zerar de verdade.");
    await prisma.$disconnect();
    return;
  }

  // Ordem segura por dependências de chave estrangeira. User é preservado.
  await prisma.invoice.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.stockEntry.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.discardedItem.deleteMany({});
  await prisma.laundryRecord.deleteMany({});
  await prisma.allWithdrawal.deleteMany({});
  await prisma.cabinet.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.employee.deleteMany({});

  console.log("\n=== DEPOIS (apenas usuários preservados) ===");
  console.table(await contar());
  console.log("\n✅ Sistema zerado. Pronto para importar os dados das planilhas.");
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error("❌ Erro:", e.message); await prisma.$disconnect(); process.exit(1); });
