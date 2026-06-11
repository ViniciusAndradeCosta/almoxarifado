import prisma from "../database/client.js";

// ===== Registra a entrada de itens no almoxarifado de forma TRANSACIONAL =====
// Incrementa o estoque do item e cria o registro de entrada.
// Ou tudo acontece, ou nada acontece.
export async function registrarEntrada({ itemId, quantity, entryDate, supplier, invoiceNumber, notes }) {
  const itmId = Number(itemId);
  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty <= 0) {
    throw { status: 400, message: "Quantidade inválida." };
  }

  return prisma.$transaction(async (tx) => {
    // Verifica se o item existe
    const item = await tx.item.findUnique({ where: { id: itmId } });
    if (!item) {
      throw { status: 400, message: "Item não encontrado." };
    }

    const dataEntrada = entryDate ? new Date(entryDate) : new Date();
    if (isNaN(dataEntrada.getTime())) {
      throw { status: 400, message: "Data de entrada inválida." };
    }

    // Cria o registro de entrada
    const newEntry = await tx.stockEntry.create({
      data: {
        itemId: itmId,
        quantity: qty,
        entryDate: dataEntrada,
        supplier: supplier || null,
        invoiceNumber: invoiceNumber || null,
        notes: notes || null,
      },
    });

    // Incrementa o estoque do item
    const updatedItem = await tx.item.update({
      where: { id: itmId },
      data: { quantity: { increment: qty } },
    });

    return { entry: newEntry, item: updatedItem };
  });
}