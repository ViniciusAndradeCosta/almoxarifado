import { buscarAlertas } from "../services/alertService.js";
import { enviarEmailAlerta } from "../services/emailService.js";

const HORARIO_RESUMO = 8; // Hora do resumo diário (8h da manhã)
const INTERVALO_VERIFICACAO_MS = 5 * 60 * 1000; // Verifica a cada 5 minutos

// Guarda o estado anterior dos alertas para detectar mudanças
let estadoAnterior = {}; // { itemId: "CRITICO" | "ALERTA" | "ATENCAO" }
let resumoEnviadoHoje = false;
let ultimoDiaEnvio = null;

function getAlertasComoMapa(alertas) {
  const mapa = {};
  alertas.critico.forEach((a) => { mapa[a.itemId] = "CRITICO"; });
  alertas.alerta.forEach((a) => { mapa[a.itemId] = "ALERTA"; });
  alertas.atencao.forEach((a) => { mapa[a.itemId] = "ATENCAO"; });
  return mapa;
}

function filtrarNovosAlertas(alertas, estadoAtual) {
  const novos = { critico: [], alerta: [], atencao: [] };

  alertas.critico.forEach((a) => {
    if (estadoAnterior[a.itemId] !== "CRITICO") novos.critico.push(a);
  });
  alertas.alerta.forEach((a) => {
    if (estadoAnterior[a.itemId] !== "ALERTA") novos.alerta.push(a);
  });
  alertas.atencao.forEach((a) => {
    if (estadoAnterior[a.itemId] !== "ATENCAO") novos.atencao.push(a);
  });

  return novos;
}

async function verificarAlertas() {
  try {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const diaAtual = agora.toDateString();

    const resultado = await buscarAlertas();
    const estadoAtual = getAlertasComoMapa(resultado.alertas);

    // === RESUMO DIÁRIO às 8h ===
    if (horaAtual >= HORARIO_RESUMO && ultimoDiaEnvio !== diaAtual && !resumoEnviadoHoje) {
      if (resultado.totalAlertas > 0) {
        console.log(`[Scheduler] Enviando resumo diário (${resultado.totalAlertas} alertas)...`);
        await enviarEmailAlerta(resultado.alertas, "📋 Resumo Diário de Estoque");
        console.log("[Scheduler] Resumo diário enviado com sucesso.");
      } else {
        console.log("[Scheduler] Resumo diário: nenhum alerta ativo.");
      }
      resumoEnviadoHoje = true;
      ultimoDiaEnvio = diaAtual;
    }

    // Reseta a flag de resumo à meia-noite
    if (ultimoDiaEnvio !== diaAtual) {
      resumoEnviadoHoje = false;
    }

    // === ALERTA IMEDIATO quando um item ENTRA num estado novo ===
    if (Object.keys(estadoAnterior).length > 0) {
      const novos = filtrarNovosAlertas(resultado.alertas, estadoAtual);
      const totalNovos = novos.critico.length + novos.alerta.length + novos.atencao.length;

      if (totalNovos > 0) {
        console.log(`[Scheduler] ${totalNovos} novo(s) alerta(s) detectado(s). Enviando e-mail imediato...`);
        await enviarEmailAlerta(novos, "🚨 Novo Alerta de Estoque");
        console.log("[Scheduler] Alerta imediato enviado com sucesso.");
      }
    } else {
      console.log("[Scheduler] Primeira verificação — registrando estado inicial dos alertas.");
    }

    // Atualiza o estado anterior
    estadoAnterior = estadoAtual;

  } catch (error) {
    console.error("[Scheduler] Erro na verificação:", error.message);
  }
}

export function iniciarScheduler() {
  console.log(`[Scheduler] Iniciado. Resumo diário às ${HORARIO_RESUMO}h. Alertas imediatos a cada 5 min.`);

  // Primeira verificação 15 segundos após o servidor subir
  setTimeout(() => {
    verificarAlertas();
  }, 15000);

  // Depois verifica a cada 5 minutos
  setInterval(() => {
    verificarAlertas();
  }, INTERVALO_VERIFICACAO_MS);
}