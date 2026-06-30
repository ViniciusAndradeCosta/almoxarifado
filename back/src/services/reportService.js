import prisma from "../database/client.js";

// ===== Relatório detalhado de um item específico =====
// Retorna: dados do item, total de saídas, total de entradas,
// histórico de movimentações e consumo por período.
export async function relatorioPorItem(itemId, dataInicio, dataFim) {
  const itmId = Number(itemId);

  const item = await prisma.item.findUnique({ where: { id: itmId } });
  if (!item) {
    throw { status: 404, message: "Item não encontrado." };
  }

  // Monta o filtro de data (opcional)
  const filtroData = {};
  if (dataInicio) filtroData.gte = new Date(dataInicio);
  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    filtroData.lte = fim;
  }

  const whereSaida = { itemId: itmId };
  const whereEntrada = { itemId: itmId };

  if (dataInicio || dataFim) {
    whereSaida.withdrawalDate = filtroData;
    whereEntrada.entryDate = filtroData;
  }

  // Busca saídas do período
  const saidas = await prisma.allWithdrawal.findMany({
    where: {
      itemId: itmId,
      ...(dataInicio || dataFim ? { withdrawalDate: filtroData } : {}),
    },
    orderBy: { withdrawalDate: "desc" },
  });

  // Busca entradas do período
  const entradas = await prisma.stockEntry.findMany({
    where: whereEntrada,
    orderBy: { entryDate: "desc" },
  });

  // Calcula totais
  const totalSaidas = saidas.reduce((acc, s) => acc + s.quantity, 0);
  const totalEntradas = entradas.reduce((acc, e) => acc + e.quantity, 0);

  // Agrupa saídas por mês
  const consumoPorMes = {};
  saidas.forEach((s) => {
    const data = new Date(s.withdrawalDate);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    consumoPorMes[chave] = (consumoPorMes[chave] || 0) + s.quantity;
  });

  // Agrupa entradas por mês
  const entradasPorMes = {};
  entradas.forEach((e) => {
    const data = new Date(e.entryDate);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    entradasPorMes[chave] = (entradasPorMes[chave] || 0) + e.quantity;
  });

  // Top funcionários que mais retiraram este item
  const consumoPorFuncionario = {};
  saidas.forEach((s) => {
    const nome = s.employeeName;
    consumoPorFuncionario[nome] = (consumoPorFuncionario[nome] || 0) + s.quantity;
  });

  const topFuncionarios = Object.entries(consumoPorFuncionario)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    item: {
      id: item.id,
      name: item.name,
      type: item.type,
      sector: item.sector,
      size: item.size,
      estoqueAtual: item.quantity,
    },
    periodo: {
      inicio: dataInicio || "desde o início",
      fim: dataFim || "até agora",
    },
    totalSaidas,
    totalEntradas,
    saldoPeriodo: totalEntradas - totalSaidas,
    consumoPorMes,
    entradasPorMes,
    topFuncionarios,
    detalheSaidas: saidas,
    detalheEntradas: entradas,
  };
}

// ===== Relatório geral de consumo (todos os itens) =====
// Mostra o ranking de itens mais consumidos no período.
export async function relatorioConsumoGeral(dataInicio, dataFim) {
  const filtroData = {};
  if (dataInicio) filtroData.gte = new Date(dataInicio);
  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    filtroData.lte = fim;
  }

  const where = {};
  if (dataInicio || dataFim) {
    where.withdrawalDate = filtroData;
  }

  const saidas = await prisma.allWithdrawal.findMany({ where });

  // Agrupa por item
  const porItem = {};
  saidas.forEach((s) => {
    if (!porItem[s.itemId]) {
      porItem[s.itemId] = {
        itemId: s.itemId,
        itemName: s.itemName,
        itemType: s.itemType,
        itemSector: s.itemSector,
        itemSize: s.itemSize || null,
        totalSaidas: 0,
      };
    }
    porItem[s.itemId].totalSaidas += s.quantity;
  });

  // Busca estoque atual de cada item
  const itens = await prisma.item.findMany();
  const estoqueMap = {};
  itens.forEach((i) => {
    estoqueMap[i.id] = i.quantity;
  });

  // Monta resultado com estoque atual
  const resultado = Object.values(porItem)
    .map((item) => ({
      ...item,
      estoqueAtual: estoqueMap[item.itemId] ?? 0,
    }))
    .sort((a, b) => b.totalSaidas - a.totalSaidas);

  return {
    periodo: {
      inicio: dataInicio || "desde o início",
      fim: dataFim || "até agora",
    },
    totalItensMovimentados: resultado.length,
    itens: resultado,
  };
}

// ===== Resumo do estoque atual =====
// Lista todos os itens com quantidade, tipo e setor.
export async function resumoEstoque() {
  const itens = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });

  const semEstoque = itens.filter((i) => i.quantity === 0);
  const comEstoque = itens.filter((i) => i.quantity > 0);

  return {
    totalItens: itens.length,
    itensSemEstoque: semEstoque.length,
    itensComEstoque: comEstoque.length,
    itens: itens.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      sector: i.sector,
      size: i.size,
      quantity: i.quantity,
    })),
  };
}

// ===== Gera dados formatados para CSV =====
export async function gerarCSVConsumo(dataInicio, dataFim) {
  const filtroData = {};
  if (dataInicio) filtroData.gte = new Date(dataInicio);
  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    filtroData.lte = fim;
  }

  const where = {};
  if (dataInicio || dataFim) {
    where.withdrawalDate = filtroData;
  }

  const saidas = await prisma.allWithdrawal.findMany({
    where,
    orderBy: { withdrawalDate: "desc" },
  });

  // Cabeçalho do CSV
  const header = "Data;Item;Tipo;Setor;Tamanho;Quantidade;Funcionario;Departamento;Empresa";
  const linhas = saidas.map((s) => {
    const data = new Date(s.withdrawalDate);
    const dataFormatada = `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;
    return `${dataFormatada};${s.itemName};${s.itemType};${s.itemSector};${s.itemSize || ""};${s.quantity};${s.employeeName};${s.employeeDepartment};${s.employeeCompany}`;
  });

  return [header, ...linhas].join("\n");
}