import { relatorioPorItem, relatorioConsumoGeral, resumoEstoque, gerarCSVConsumo } from "../../services/reportService.js";

// GET /reports/item/:itemId?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
export async function getReportByItem(req, res) {
  const { itemId } = req.params;
  const { dataInicio, dataFim } = req.query;

  try {
    const report = await relatorioPorItem(itemId, dataInicio, dataFim);
    return res.json(report);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
}

// GET /reports/consumption?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
export async function getConsumptionReport(req, res) {
  const { dataInicio, dataFim } = req.query;

  try {
    const report = await relatorioConsumoGeral(dataInicio, dataFim);
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /reports/stock-summary
export async function getStockSummary(req, res) {
  try {
    const report = await resumoEstoque();
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /reports/export/csv?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
export async function exportCSV(req, res) {
  const { dataInicio, dataFim } = req.query;

  try {
    const csv = await gerarCSVConsumo(dataInicio, dataFim);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio_consumo.csv");
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}