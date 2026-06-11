import prisma from "../../database/client.js";
import { registrarEntrada } from "../../services/entryService.js";

// POST registra entrada de itens
export async function createStockEntry(req, res) {
  const { itemId, quantity, entryDate, supplier, invoiceNumber, notes } = req.body;

  try {
    const result = await registrarEntrada({ itemId, quantity, entryDate, supplier, invoiceNumber, notes });
    return res.status(201).json({
      success: true,
      entry: result.entry,
      item: result.item,
      message: "Entrada registrada com sucesso (estoque atualizado).",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      error: error.message || "Erro ao registrar entrada.",
    });
  }
}

// GET lista todas as entradas
export async function getStockEntries(req, res) {
  try {
    const entries = await prisma.stockEntry.findMany({
      orderBy: { entryDate: "desc" },
      include: {
        item: {
          select: { name: true, type: true, sector: true, size: true },
        },
      },
    });
    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET entradas de um item específico
export async function getStockEntriesByItem(req, res) {
  const { itemId } = req.params;

  try {
    const entries = await prisma.stockEntry.findMany({
      where: { itemId: parseInt(itemId) },
      orderBy: { entryDate: "desc" },
      include: {
        item: {
          select: { name: true, type: true, sector: true, size: true },
        },
      },
    });
    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE remove entrada (sem alterar estoque)
export async function deleteStockEntry(req, res) {
  const { id } = req.params;

  try {
    const entry = await prisma.stockEntry.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ success: true, entry });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}