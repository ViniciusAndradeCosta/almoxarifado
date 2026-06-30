import prisma from "../../database/client.js";
import { registrarDescarte, resumoDescartes } from "../../services/discardService.js";

// POST /discard — registra descarte de peças
export async function createDiscard(req, res) {
  const { itemId, quantity, reason, notes, discardedBy, discardDate } = req.body;

  try {
    const result = await registrarDescarte({ itemId, quantity, reason, notes, discardedBy, discardDate });
    return res.status(201).json({
      success: true,
      discard: result.discard,
      item: result.item,
      message: "Descarte registrado com sucesso (estoque atualizado).",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      error: error.message || "Erro ao registrar descarte.",
    });
  }
}

// GET /getdiscarded — lista todos os descartes
export async function getDiscarded(req, res) {
  try {
    const discards = await prisma.discardedItem.findMany({
      orderBy: { id: "desc" }, // mais recente registrado primeiro
      include: {
        item: {
          select: { name: true, type: true, sector: true, size: true },
        },
      },
    });
    return res.json(discards);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /getdiscarded/:itemId — descartes de um item específico
export async function getDiscardedByItem(req, res) {
  const { itemId } = req.params;

  try {
    const discards = await prisma.discardedItem.findMany({
      where: { itemId: parseInt(itemId) },
      orderBy: { discardDate: "desc" },
      include: {
        item: {
          select: { name: true, type: true, sector: true, size: true },
        },
      },
    });
    return res.json(discards);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /reports/discards?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
export async function getDiscardReport(req, res) {
  const { dataInicio, dataFim } = req.query;

  try {
    const report = await resumoDescartes(dataInicio, dataFim);
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /deletediscard/:id — remove registro de descarte (sem alterar estoque)
export async function deleteDiscard(req, res) {
  const { id } = req.params;

  try {
    const discard = await prisma.discardedItem.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ success: true, discard });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}