import { buscarAlertas, buscarAlertasPorItem, contarAlertas } from "../../services/alertService.js";

// GET lista todos os alertas detalhados
export async function getAlerts(req, res) {
  try {
    const result = await buscarAlertas();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET alerta de um item específico
export async function getAlertByItem(req, res) {
  const { itemId } = req.params;

  try {
    const result = await buscarAlertasPorItem(itemId);
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
}

// GET contagem rápida (para badge/sino)
export async function getAlertCount(req, res) {
  try {
    const result = await contarAlertas();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}