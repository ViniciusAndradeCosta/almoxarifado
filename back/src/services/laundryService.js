import prisma from "../database/client.js";

// Envia peças para a lavanderia (TRANSACIONAL)
// Decrementa o estoque temporariamente e cria o registro.
export async function enviarParaLavanderia({ itemId, quantity, expectedReturn, laundryName, sentBy, notes, sendDate }) {
  const itmId = Number(itemId);
  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty <= 0) {
    throw { status: 400, message: "Quantidade inválida." };
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itmId } });
    if (!item) {
      throw { status: 400, message: "Item não encontrado." };
    }

    // Trava: não pode enviar mais do que tem em estoque
    if (item.quantity < qty) {
      throw {
        status: 400,
        message: `Estoque insuficiente. Disponível: ${item.quantity}, tentando enviar: ${qty}.`,
      };
    }

    const dataEnvio = sendDate ? new Date(sendDate) : new Date();
    if (isNaN(dataEnvio.getTime())) {
      throw { status: 400, message: "Data de envio inválida." };
    }

    let dataRetornoPrevisto = null;
    if (expectedReturn) {
      dataRetornoPrevisto = new Date(expectedReturn);
      if (isNaN(dataRetornoPrevisto.getTime())) {
        throw { status: 400, message: "Data de retorno previsto inválida." };
      }
    }

    // Cria o registro de lavanderia
    const record = await tx.laundryRecord.create({
      data: {
        itemId: itmId,
        quantity: qty,
        status: "ENVIADA",
        sendDate: dataEnvio,
        expectedReturn: dataRetornoPrevisto,
        laundryName: laundryName || null,
        sentBy: sentBy || null,
        notes: notes || null,
      },
    });

    // Decrementa o estoque (saída temporária)
    const updatedItem = await tx.item.update({
      where: { id: itmId },
      data: { quantity: { decrement: qty } },
    });

    return { record, item: updatedItem };
  });
}

// Registra retorno da lavanderia (TRANSACIONAL)
// Incrementa o estoque de volta e atualiza o registro.
export async function retornarDaLavanderia(recordId, { quantityReturned, returnDate, notes }) {
  const recId = Number(recordId);

  return prisma.$transaction(async (tx) => {
    const record = await tx.laundryRecord.findUnique({
      where: { id: recId },
    });

    if (!record) {
      throw { status: 404, message: "Registro de lavanderia não encontrado." };
    }

    if (record.status === "RETORNADA") {
      throw { status: 400, message: "Este lote já foi retornado." };
    }

    // Quantidade retornada pode ser menor (peças perdidas/danificadas na lavanderia)
    const qtyReturn = quantityReturned !== undefined ? Number(quantityReturned) : record.quantity;

    if (!Number.isInteger(qtyReturn) || qtyReturn <= 0) {
      throw { status: 400, message: "Quantidade de retorno inválida." };
    }

    if (qtyReturn > record.quantity) {
      throw {
        status: 400,
        message: `Quantidade de retorno (${qtyReturn}) maior que a enviada (${record.quantity}).`,
      };
    }

    const dataRetorno = returnDate ? new Date(returnDate) : new Date();

    // Atualiza o registro para RETORNADA
    const updatedRecord = await tx.laundryRecord.update({
      where: { id: recId },
      data: {
        status: "RETORNADA",
        returnDate: dataRetorno,
        notes: notes ? `${record.notes || ""} | Retorno: ${notes}` : record.notes,
      },
    });

    // Incrementa o estoque com a quantidade que voltou
    const updatedItem = await tx.item.update({
      where: { id: record.itemId },
      data: { quantity: { increment: qtyReturn } },
    });

    // Se voltou menos do que enviou, registra a diferença como perda
    const perdas = record.quantity - qtyReturn;
    let discardRecord = null;

    if (perdas > 0) {
      discardRecord = await tx.discardedItem.create({
        data: {
          itemId: record.itemId,
          quantity: perdas,
          reason: "DANO",
          notes: `Perda na lavanderia (registro #${recId}). Enviadas: ${record.quantity}, retornaram: ${qtyReturn}.`,
          discardedBy: "Sistema (lavanderia)",
          discardDate: dataRetorno,
        },
      });
    }

    return { record: updatedRecord, item: updatedItem, perdas, discardRecord };
  });
}

// Busca peças que estão na lavanderia (pendentes de retorno)
export async function pecasNaLavanderia() {
  const pendentes = await prisma.laundryRecord.findMany({
    where: { status: "ENVIADA" },
    orderBy: { sendDate: "asc" },
    include: {
      item: {
        select: { name: true, type: true, sector: true, size: true },
      },
    },
  });

  // Identifica atrasados (passou da data prevista de retorno)
  const hoje = new Date();
  const resultado = pendentes.map((r) => {
    const atrasado = r.expectedReturn && new Date(r.expectedReturn) < hoje;
    const diasNaLavanderia = Math.floor((hoje - new Date(r.sendDate)) / (1000 * 60 * 60 * 24));
    return {
      ...r,
      atrasado,
      diasNaLavanderia,
    };
  });

  const totalPecas = resultado.reduce((acc, r) => acc + r.quantity, 0);
  const totalAtrasados = resultado.filter((r) => r.atrasado).length;

  return {
    totalRegistros: resultado.length,
    totalPecas,
    totalAtrasados,
    registros: resultado,
  };
}

//Resumo geral da lavanderia
export async function resumoLavanderia(dataInicio, dataFim) {
  const filtroData = {};
  if (dataInicio) filtroData.gte = new Date(dataInicio);
  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    filtroData.lte = fim;
  }

  const where = {};
  if (dataInicio || dataFim) {
    where.sendDate = filtroData;
  }

  const registros = await prisma.laundryRecord.findMany({
    where,
    include: {
      item: {
        select: { name: true, type: true, sector: true, size: true },
      },
    },
    orderBy: { sendDate: "desc" },
  });

  const enviadas = registros.filter((r) => r.status === "ENVIADA");
  const retornadas = registros.filter((r) => r.status === "RETORNADA");

  return {
    totalRegistros: registros.length,
    pendentes: enviadas.length,
    retornadas: retornadas.length,
    totalPecasEnviadas: registros.reduce((acc, r) => acc + r.quantity, 0),
    registros,
  };
}