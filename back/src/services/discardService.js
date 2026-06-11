import prisma from "../database/client.js";

const MOTIVOS_VALIDOS = ["DESGASTE", "DANO", "EXTRAVIO", "VENCIDO", "OUTRO"];

// Registra descarte de peças de forma TRANSACIONAL
// Decrementa o estoque e cria o registro de descarte.
export async function registrarDescarte({ itemId, quantity, reason, notes, discardedBy, discardDate }) {
  const itmId = Number(itemId);
  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty <= 0) {
    throw { status: 400, message: "Quantidade inválida." };
  }

  const motivoUpper = (reason || "").toUpperCase();
  if (!MOTIVOS_VALIDOS.includes(motivoUpper)) {
    throw { status: 400, message: `Motivo inválido. Use: ${MOTIVOS_VALIDOS.join(", ")}` };
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itmId } });
    if (!item) {
      throw { status: 400, message: "Item não encontrado." };
    }

    // Trava: não pode descartar mais do que tem em estoque
    if (item.quantity < qty) {
      throw {
        status: 400,
        message: `Estoque insuficiente para descarte. Disponível: ${item.quantity}, tentando descartar: ${qty}.`,
      };
    }

    const dataDescarte = discardDate ? new Date(discardDate) : new Date();
    if (isNaN(dataDescarte.getTime())) {
      throw { status: 400, message: "Data de descarte inválida." };
    }

    // Cria o registro de descarte
    const newDiscard = await tx.discardedItem.create({
      data: {
        itemId: itmId,
        quantity: qty,
        reason: motivoUpper,
        notes: notes || null,
        discardedBy: discardedBy || null,
        discardDate: dataDescarte,
      },
    });

    // Decrementa o estoque
    const updatedItem = await tx.item.update({
      where: { id: itmId },
      data: { quantity: { decrement: qty } },
    });

    return { discard: newDiscard, item: updatedItem };
  });
}

// Resumo de descartes por motivo
export async function resumoDescartes(dataInicio, dataFim) {
  const filtroData = {};
  if (dataInicio) filtroData.gte = new Date(dataInicio);
  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    filtroData.lte = fim;
  }

  const where = {};
  if (dataInicio || dataFim) {
    where.discardDate = filtroData;
  }

  const descartes = await prisma.discardedItem.findMany({
    where,
    include: {
      item: {
        select: { name: true, type: true, sector: true, size: true },
      },
    },
    orderBy: { discardDate: "desc" },
  });

  // Agrupa por motivo
  const porMotivo = {};
  descartes.forEach((d) => {
    porMotivo[d.reason] = (porMotivo[d.reason] || 0) + d.quantity;
  });

  // Agrupa por item
  const porItem = {};
  descartes.forEach((d) => {
    if (!porItem[d.itemId]) {
      porItem[d.itemId] = {
        itemId: d.itemId,
        itemName: d.item.name,
        itemType: d.item.type,
        totalDescartado: 0,
      };
    }
    porItem[d.itemId].totalDescartado += d.quantity;
  });

  const rankingItens = Object.values(porItem).sort((a, b) => b.totalDescartado - a.totalDescartado);

  return {
    totalRegistros: descartes.length,
    totalPecasDescartadas: descartes.reduce((acc, d) => acc + d.quantity, 0),
    porMotivo,
    rankingItens,
    detalhes: descartes,
  };
}