import prisma from "../database/client.js";
import { FATOR_ATENCAO } from "../config/businessRules.js";

// Busca todos os itens que precisam de atenção 
// Retorna alertas organizados por nível de urgência.
export async function buscarAlertas() {
  const itens = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });

  const alertas = {
    critico: [],  // 🔴 Estoque zerou
    alerta: [],   // 🟠 Abaixo da margem de segurança
    atencao: [],  // 🟡 Chegando perto da margem
  };

  itens.forEach((item) => {
    const margem = item.minStock || 0;
    const limiteAtencao = margem > 0 ? Math.ceil(margem * FATOR_ATENCAO) : 0;

    const registro = {
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      itemSector: item.sector,
      itemSize: item.size || null,
      estoqueAtual: item.quantity,
      margemSeguranca: margem,
      limiteAtencao,
      deficit: margem > 0 ? Math.max(0, margem - item.quantity) : 0,
    };

    if (item.quantity === 0) {
      registro.nivel = "CRITICO";
      registro.mensagem = `${item.name} está com estoque ZERADO.`;
      alertas.critico.push(registro);
    } else if (margem > 0 && item.quantity <= margem) {
      registro.nivel = "ALERTA";
      registro.mensagem = `${item.name} está abaixo da margem de segurança (${item.quantity}/${margem}).`;
      alertas.alerta.push(registro);
    } else if (limiteAtencao > 0 && item.quantity <= limiteAtencao) {
      registro.nivel = "ATENCAO";
      registro.mensagem = `${item.name} está se aproximando da margem de segurança (${item.quantity}/${margem}).`;
      alertas.atencao.push(registro);
    }
  });

  return {
    totalAlertas: alertas.critico.length + alertas.alerta.length + alertas.atencao.length,
    contagem: {
      critico: alertas.critico.length,
      alerta: alertas.alerta.length,
      atencao: alertas.atencao.length,
    },
    alertas,
  };
}

// Busca alertas apenas para um item específico
export async function buscarAlertasPorItem(itemId) {
  const itmId = Number(itemId);

  const item = await prisma.item.findUnique({ where: { id: itmId } });
  if (!item) {
    throw { status: 404, message: "Item não encontrado." };
  }

  const margem = item.minStock || 0;
  const limiteAtencao = margem > 0 ? Math.ceil(margem * FATOR_ATENCAO) : 0;

  let nivel = "OK";
  let mensagem = `${item.name} está com estoque saudável.`;

  if (item.quantity === 0) {
    nivel = "CRITICO";
    mensagem = `${item.name} está com estoque ZERADO.`;
  } else if (margem > 0 && item.quantity <= margem) {
    nivel = "ALERTA";
    mensagem = `${item.name} está abaixo da margem de segurança (${item.quantity}/${margem}).`;
  } else if (limiteAtencao > 0 && item.quantity <= limiteAtencao) {
    nivel = "ATENCAO";
    mensagem = `${item.name} está se aproximando da margem de segurança (${item.quantity}/${margem}).`;
  }

  return {
    itemId: item.id,
    itemName: item.name,
    itemType: item.type,
    itemSector: item.sector,
    estoqueAtual: item.quantity,
    margemSeguranca: margem,
    limiteAtencao,
    nivel,
    mensagem,
  };
}

// Contagem rápida de alertas (para badge/sino no frontend)
// Retorna só os números, sem detalhes — ideal para polling leve.
export async function contarAlertas() {
  const itens = await prisma.item.findMany({
    select: { quantity: true, minStock: true },
  });

  let critico = 0;
  let alerta = 0;
  let atencao = 0;

  itens.forEach((item) => {
    const margem = item.minStock || 0;
    const limiteAtencao = margem > 0 ? Math.ceil(margem * FATOR_ATENCAO) : 0;

    if (item.quantity === 0) {
      critico++;
    } else if (margem > 0 && item.quantity <= margem) {
      alerta++;
    } else if (limiteAtencao > 0 && item.quantity <= limiteAtencao) {
      atencao++;
    }
  });

  const total = critico + alerta + atencao;

  return { total, critico, alerta, atencao };
}