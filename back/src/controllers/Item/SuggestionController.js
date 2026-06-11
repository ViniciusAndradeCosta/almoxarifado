import { gerarSugestoes, atualizarMargemSeguranca, atualizarMargemEmLote } from "../../services/suggestionService.js";

// GET /suggestions — gera sugestões de pedido
export async function getSuggestions(req, res) {
  try {
    const result = await gerarSugestoes();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /item/:id/minstock — atualiza margem de segurança de um item
export async function updateMinStock(req, res) {
  const { id } = req.params;
  const { minStock } = req.body;

  try {
    const item = await atualizarMargemSeguranca(id, minStock);
    return res.json({
      success: true,
      item,
      message: `Margem de segurança atualizada para ${minStock}.`,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, error: error.message });
  }
}

// PUT /items/minstock/batch — atualiza margem em lote por setor ou tipo
export async function updateMinStockBatch(req, res) {
  const { sector, type, minStock } = req.body;

  try {
    const result = await atualizarMargemEmLote({ sector, type }, minStock);
    return res.json({
      success: true,
      ...result,
      message: `Margem atualizada para ${result.atualizados} itens.`,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, error: error.message });
  }
}