import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarEmailAlerta(alertas, assunto) {
  const destinatario = process.env.EMAIL_DESTINATARIO;

  if (!destinatario || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Configuração de e-mail incompleta. Alerta não enviado.");
    return;
  }

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
        ⚠️ Alerta de Estoque — Almoxarifado
      </h2>
      <p>Os seguintes itens precisam de atenção:</p>
  `;

  if (alertas.critico.length > 0) {
    html += `
      <h3 style="color: #dc3545;">🔴 CRÍTICO — Estoque Zerado (${alertas.critico.length})</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #dc3545; color: white;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tipo</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Setor</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Estoque</th>
          </tr>
        </thead>
        <tbody>
    `;
    alertas.critico.forEach((a) => {
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemType}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemSector}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #dc3545; font-weight: bold;">0</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  }

  if (alertas.alerta.length > 0) {
    html += `
      <h3 style="color: #fd7e14;">🟠 ALERTA — Abaixo da Margem (${alertas.alerta.length})</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #fd7e14; color: white;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tipo</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Setor</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Estoque</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Margem</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Faltam</th>
          </tr>
        </thead>
        <tbody>
    `;
    alertas.alerta.forEach((a) => {
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemType}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemSector}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${a.estoqueAtual}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${a.margemSeguranca}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #dc3545;">${a.deficit}</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  }

  if (alertas.atencao.length > 0) {
    html += `
      <h3 style="color: #0dcaf0;">🟡 ATENÇÃO — Próximo da Margem (${alertas.atencao.length})</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #0dcaf0; color: white;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tipo</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Setor</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Estoque</th>
            <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Margem</th>
          </tr>
        </thead>
        <tbody>
    `;
    alertas.atencao.forEach((a) => {
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemType}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${a.itemSector}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${a.estoqueAtual}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${a.margemSeguranca}</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  }

  html += `
      <hr style="border: 1px solid #eee; margin-top: 30px;">
      <p style="color: #666; font-size: 12px;">
        Este é um alerta automático do Sistema de Almoxarifado.<br>
        Enviado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
      </p>
    </div>
  `;

  const totalAlertas = alertas.critico.length + alertas.alerta.length + alertas.atencao.length;

  const mailOptions = {
    from: `"Almoxarifado - Alertas" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: assunto || `⚠️ Alerta de Estoque: ${totalAlertas} item(ns) precisam de atenção`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Alerta enviado para ${destinatario} — ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[Email] Erro ao enviar alerta:", error.message);
    throw error;
  }
}