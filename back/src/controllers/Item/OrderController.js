import prisma from "../../database/client.js";
import { criarPedido, atualizarStatusPedido, registrarRecebimento } from "../../services/orderService.js";
import { enviarEmailPedido } from "../../services/emailService.js";

// POST /order — cria um novo pedido
export async function createOrder(req, res) {
  const { orderDate, supplier, notes, items } = req.body;

  try {
    const order = await criarPedido({ orderDate, supplier, notes, items });

    // Envia email em background — não bloqueia a resposta ao frontend
    enviarEmailPedido(order).catch(err =>
      console.error("[Email] Falha ao enviar email do pedido:", err.message)
    );

    return res.status(201).json({
      success: true,
      order,
      message: "Pedido criado com sucesso.",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      error: error.message || "Erro ao criar pedido.",
    });
  }
}

// GET /getorders — lista todos os pedidos com seus itens
export async function getOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: "desc" },
      include: { items: true },
    });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /getorder/:id — busca um pedido específico
export async function getOrder(req, res) {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /updateorderstatus/:id — atualiza o status do pedido
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await atualizarStatusPedido(id, status);
    return res.json({
      success: true,
      order,
      message: "Status atualizado com sucesso.",
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "Erro ao atualizar status.",
    });
  }
}

// POST /receiveorderitem/:orderItemId — registra recebimento de item do pedido
export async function receiveOrderItem(req, res) {
  const { orderItemId } = req.params;
  const { quantityReceived } = req.body;

  try {
    const result = await registrarRecebimento(orderItemId, quantityReceived);
    return res.json({
      success: true,
      orderItem: result.orderItem,
      orderStatus: result.newStatus,
      message: "Recebimento registrado com sucesso.",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      error: error.message || "Erro ao registrar recebimento.",
    });
  }
}

// DELETE /deleteorder/:id — deleta um pedido e todos os seus itens
export async function deleteOrder(req, res) {
  const { id } = req.params;

  try {
    const order = await prisma.order.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}