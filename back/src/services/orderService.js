import prisma from "../database/client.js";

// ===== Cria um novo pedido de uniformes com seus itens =====
export async function criarPedido({ orderDate, supplier, notes, items }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "O pedido precisa ter pelo menos um item." };
  }

  // Valida cada item do pedido
  for (const item of items) {
    if (!item.itemName || !item.quantity) {
      throw { status: 400, message: "Cada item precisa ter nome e quantidade." };
    }
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw { status: 400, message: `Quantidade inválida para o item "${item.itemName}".` };
    }
  }

  return prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        supplier: supplier || null,
        notes: notes || null,
        items: {
          create: items.map((item) => ({
            itemId: item.itemId ? Number(item.itemId) : null,
            itemName: item.itemName,
            itemType: item.itemType || null,
            itemSize: item.itemSize || null,
            quantity: Number(item.quantity),
            quantityReceived: 0,
          })),
        },
      },
      include: { items: true },
    });

    return newOrder;
  });
}

// ===== Atualiza o status de um pedido =====
export async function atualizarStatusPedido(orderId, newStatus) {
  const statusValidos = ["PENDENTE", "PARCIAL", "ENTREGUE", "CANCELADO"];

  if (!statusValidos.includes(newStatus)) {
    throw { status: 400, message: `Status inválido. Use: ${statusValidos.join(", ")}` };
  }

  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order) {
    throw { status: 404, message: "Pedido não encontrado." };
  }

  return prisma.order.update({
    where: { id: Number(orderId) },
    data: { status: newStatus },
    include: { items: true },
  });
}

// ===== Registra recebimento parcial ou total de um item do pedido =====
// Quando itens do pedido chegam, atualiza a quantidade recebida
// e pode criar a entrada no estoque automaticamente.
export async function registrarRecebimento(orderItemId, quantityReceived) {
  const qty = Number(quantityReceived);

  if (!Number.isInteger(qty) || qty <= 0) {
    throw { status: 400, message: "Quantidade recebida inválida." };
  }

  return prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findUnique({
      where: { id: Number(orderItemId) },
      include: { order: true },
    });

    if (!orderItem) {
      throw { status: 404, message: "Item do pedido não encontrado." };
    }

    const totalRecebido = orderItem.quantityReceived + qty;
    if (totalRecebido > orderItem.quantity) {
      throw {
        status: 400,
        message: `Quantidade excede o pedido. Pedido: ${orderItem.quantity}, já recebido: ${orderItem.quantityReceived}, tentando receber: ${qty}.`,
      };
    }

    // Atualiza quantidade recebida do item do pedido
    const updatedOrderItem = await tx.orderItem.update({
      where: { id: Number(orderItemId) },
      data: { quantityReceived: totalRecebido },
    });

    // Se o item tem referência a um item do estoque, incrementa o estoque
    if (orderItem.itemId) {
      await tx.item.update({
        where: { id: orderItem.itemId },
        data: { quantity: { increment: qty } },
      });

      // Cria registro na tabela de entradas
      await tx.stockEntry.create({
        data: {
          itemId: orderItem.itemId,
          quantity: qty,
          entryDate: new Date(),
          supplier: orderItem.order.supplier,
          invoiceNumber: null,
          notes: `Recebimento do pedido #${orderItem.orderId}`,
        },
      });
    }

    // Verifica se todos os itens do pedido foram totalmente recebidos
    const allItems = await tx.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    });

    const todosEntregues = allItems.every((i) => {
      const recebido = i.id === updatedOrderItem.id ? totalRecebido : i.quantityReceived;
      return recebido >= i.quantity;
    });

    const algumEntregue = allItems.some((i) => {
      const recebido = i.id === updatedOrderItem.id ? totalRecebido : i.quantityReceived;
      return recebido > 0;
    });

    // Atualiza status do pedido automaticamente
    let novoStatus = orderItem.order.status;
    if (todosEntregues) {
      novoStatus = "ENTREGUE";
    } else if (algumEntregue) {
      novoStatus = "PARCIAL";
    }

    if (novoStatus !== orderItem.order.status) {
      await tx.order.update({
        where: { id: orderItem.orderId },
        data: { status: novoStatus },
      });
    }

    return { orderItem: updatedOrderItem, newStatus: novoStatus };
  });
}