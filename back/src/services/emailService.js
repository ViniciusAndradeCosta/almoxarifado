import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Email de alertas de estoque ──
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

// ── Email de novo pedido ──
export async function enviarEmailPedido(pedido) {
  const destinatario = process.env.EMAIL_DESTINATARIO;

  if (!destinatario || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Configuração incompleta. Email de pedido não enviado.");
    return;
  }

  const dataPedido = new Date(pedido.orderDate || new Date()).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const totalItens = (pedido.items || []).reduce((acc, i) => acc + i.quantity, 0);

  let itensHtml = "";
  (pedido.items || []).forEach((item, index) => {
    const bg = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
    itensHtml += `
      <tr style="background-color: ${bg};">
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; font-size: 13px;">${item.itemName || "—"}</td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; text-align: center; font-weight: bold; color: #CC0000; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; text-align: center;">
          <span style="background: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px;">
            PENDENTE
          </span>
        </td>
      </tr>
    `;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">

      <!-- Header -->
      <div style="background: #1A1A1A; padding: 24px 28px; border-radius: 8px 8px 0 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="display: inline-block; background: #CC0000; width: 4px; height: 36px; border-radius: 2px; vertical-align: middle; margin-right: 14px;"></div>
              <div style="display: inline-block; vertical-align: middle;">
                <div style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">
                  Novo Pedido Registrado
                </div>
                <div style="color: #999999; font-size: 12px; margin-top: 3px;">
                  Hiper Comercial Monlevade — Almoxarifado
                </div>
              </div>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="background: #CC0000; color: white; padding: 6px 14px; border-radius: 5px; font-size: 13px; font-weight: 700; display: inline-block;">
                #${pedido.id || "—"}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="background: #ffffff; border: 1px solid #e0e0e0; border-top: none; padding: 24px 28px;">

        <!-- Info do pedido -->
        <table style="width: 100%; margin-bottom: 24px; border-collapse: collapse; background: #f8f8f8; border-radius: 6px; overflow: hidden;">
          <tr>
            <td style="padding: 10px 16px; color: #666; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: 35%; border-bottom: 1px solid #eee;">
              Fornecedor
            </td>
            <td style="padding: 10px 16px; font-weight: 700; font-size: 13px; border-bottom: 1px solid #eee;">
              ${pedido.supplier || "Não informado"}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #666; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #eee;">
              Data do Pedido
            </td>
            <td style="padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #eee;">
              ${dataPedido}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #666; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; ${pedido.notes ? "border-bottom: 1px solid #eee;" : ""}">
              Total
            </td>
            <td style="padding: 10px 16px; font-size: 13px; ${pedido.notes ? "border-bottom: 1px solid #eee;" : ""}">
              <strong style="color: #CC0000;">${totalItens} unidades</strong> em ${pedido.items?.length || 0} tipo(s)
            </td>
          </tr>
          ${pedido.notes ? `
          <tr>
            <td style="padding: 10px 16px; color: #666; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              Observações
            </td>
            <td style="padding: 10px 16px; font-size: 13px; color: #555;">
              ${pedido.notes}
            </td>
          </tr>
          ` : ""}
        </table>

        <!-- Tabela de itens -->
        <div style="font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
          Itens Solicitados
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #CC0000; color: white;">
              <th style="padding: 10px 12px; text-align: left; border: 1px solid #b00000; font-weight: 700;">Item</th>
              <th style="padding: 10px 12px; text-align: center; border: 1px solid #b00000; font-weight: 700; width: 110px;">Quantidade</th>
              <th style="padding: 10px 12px; text-align: center; border: 1px solid #b00000; font-weight: 700; width: 120px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${itensHtml}
          </tbody>
          <tfoot>
            <tr style="background: #1A1A1A; color: white;">
              <td style="padding: 10px 12px; font-weight: 700; border: 1px solid #333;">Total</td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 800; font-size: 15px; color: #CC0000; border: 1px solid #333;">${totalItens}</td>
              <td style="padding: 10px 12px; border: 1px solid #333;"></td>
            </tr>
          </tfoot>
        </table>

      </div>

      <!-- Footer -->
      <div style="background: #f5f5f5; border: 1px solid #e0e0e0; border-top: none; padding: 14px 28px; border-radius: 0 0 8px 8px;">
        <p style="color: #aaa; font-size: 11px; margin: 0; line-height: 1.6;">
          Email automático do Sistema de Almoxarifado · Hiper Comercial Monlevade<br>
          Enviado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
        </p>
      </div>

    </div>
  `;

  const mailOptions = {
    from: `"Almoxarifado - Pedidos" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: `🛒 Novo Pedido #${pedido.id || ""} — ${pedido.supplier || "Fornecedor"} (${totalItens} itens)`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Pedido #${pedido.id} enviado para ${destinatario} — ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[Email] Erro ao enviar email de pedido:", error.message);
    // Não lança o erro para não quebrar a criação do pedido
  }
}