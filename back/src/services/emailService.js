import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Componentes de layout reutilizáveis ──
const headerHiper = (titulo, subtitulo, badge = "", corBarra = "#CC0000") => `
  <div style="background:#1A1A1A;padding:22px 28px;border-radius:8px 8px 0 0">
    <table style="width:100%;border-collapse:collapse"><tr>
      <td style="vertical-align:middle">
        <table style="border-collapse:collapse"><tr>
          <td style="vertical-align:middle;padding-right:14px">
            <div style="background:${corBarra};width:5px;height:40px;border-radius:3px"></div>
          </td>
          <td style="vertical-align:middle">
            <div style="color:#fff;font-size:17px;font-weight:800;font-family:Arial,sans-serif;letter-spacing:-0.3px">${titulo}</div>
            <div style="color:#999;font-size:12px;margin-top:3px;font-family:Arial,sans-serif">${subtitulo}</div>
          </td>
        </tr></table>
      </td>
      ${badge ? `<td style="text-align:right;vertical-align:middle">
        <div style="background:${corBarra};color:#fff;padding:6px 16px;border-radius:5px;font-size:13px;font-weight:800;font-family:Arial,sans-serif;display:inline-block">${badge}</div>
      </td>` : ""}
    </tr></table>
  </div>`;

const footerHiper = (corBorda = "#CC0000") => `
  <div style="background:#1A1A1A;padding:14px 28px;border-radius:0 0 8px 8px;border-top:3px solid ${corBorda}">
    <table style="width:100%;border-collapse:collapse"><tr>
      <td>
        <div style="color:#fff;font-size:13px;font-weight:800;font-family:Arial,sans-serif">Hiper Comercial Monlevade</div>
        <div style="color:#666;font-size:11px;font-family:Arial,sans-serif;margin-top:2px">Sistema de Almoxarifado · Email automático</div>
      </td>
      <td style="text-align:right;vertical-align:middle">
        <div style="color:#555;font-size:11px;font-family:Arial,sans-serif">${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</div>
      </td>
    </tr></table>
  </div>`;

const th = (bg) => `style="padding:10px 14px;text-align:left;border:1px solid ${bg}cc;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#fff;background:${bg}"`;
const thC = (bg) => `style="padding:10px 14px;text-align:center;border:1px solid ${bg}cc;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#fff;background:${bg}"`;
const td = (extra = "") => `style="padding:9px 14px;border:1px solid #e8e8e8;font-family:Arial,sans-serif;font-size:13px;color:#333;${extra}"`;

// ── Email de alertas de estoque ──
export async function enviarEmailAlerta(alertas, assunto) {
  const destinatario = process.env.EMAIL_DESTINATARIO;
  if (!destinatario || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[Email] Configuração incompleta. Alerta não enviado.");
    return;
  }

  const totalAlertas = alertas.critico.length + alertas.alerta.length + alertas.atencao.length;

  // ── Seção CRÍTICO ──
  let secaoCritico = "";
  if (alertas.critico.length > 0) {
    const linhas = alertas.critico.map((a, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff5f5" : "#fff"}">
        <td ${td("font-weight:700")}>${a.itemName}</td>
        <td ${td()}>${a.itemType || "—"}</td>
        <td ${td()}>${a.itemSector || "—"}</td>
        ${a.itemSize ? `<td ${td("text-align:center;font-weight:700;color:#CC0000")}>${a.itemSize}</td>` : ""}
        <td ${td("text-align:center;font-weight:800;color:#CC0000;font-size:16px")}>0</td>
        <td ${td("text-align:center")}>${a.margemSeguranca || "—"}</td>
      </tr>`).join("");

    secaoCritico = `
      <div style="margin-bottom:24px">
        <div style="background:#CC0000;color:#fff;display:inline-block;padding:5px 14px;border-radius:4px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:10px">
          🔴 CRÍTICO — ESTOQUE ZERADO (${alertas.critico.length})
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th ${th("#CC0000")}>Item</th>
            <th ${th("#CC0000")}>Tipo</th>
            <th ${th("#CC0000")}>Setor</th>
            ${alertas.critico.some(a => a.itemSize) ? `<th ${thC("#CC0000")}>Tam.</th>` : ""}
            <th ${thC("#CC0000")}>Estoque</th>
            <th ${thC("#CC0000")}>Margem</th>
          </tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>`;
  }

  // ── Seção ALERTA ──
  let secaoAlerta = "";
  if (alertas.alerta.length > 0) {
    const linhas = alertas.alerta.map((a, i) => `
      <tr style="background:${i % 2 === 0 ? "#fffbf0" : "#fff"}">
        <td ${td("font-weight:700")}>${a.itemName}</td>
        <td ${td()}>${a.itemType || "—"}</td>
        <td ${td()}>${a.itemSector || "—"}</td>
        ${a.itemSize ? `<td ${td("text-align:center;font-weight:700")}>${a.itemSize}</td>` : ""}
        <td ${td("text-align:center;font-weight:800;color:#b45309")}>${a.estoqueAtual}</td>
        <td ${td("text-align:center")}>${a.margemSeguranca}</td>
        <td ${td("text-align:center;font-weight:700;color:#CC0000")}>${a.deficit}</td>
      </tr>`).join("");

    secaoAlerta = `
      <div style="margin-bottom:24px">
        <div style="background:#b45309;color:#fff;display:inline-block;padding:5px 14px;border-radius:4px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:10px">
          🟠 ABAIXO DA MARGEM (${alertas.alerta.length})
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th ${th("#b45309")}>Item</th>
            <th ${th("#b45309")}>Tipo</th>
            <th ${th("#b45309")}>Setor</th>
            ${alertas.alerta.some(a => a.itemSize) ? `<th ${thC("#b45309")}>Tam.</th>` : ""}
            <th ${thC("#b45309")}>Estoque</th>
            <th ${thC("#b45309")}>Margem</th>
            <th ${thC("#b45309")}>Faltam</th>
          </tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>`;
  }

  // ── Seção ATENÇÃO ──
  let secaoAtencao = "";
  if (alertas.atencao.length > 0) {
    const linhas = alertas.atencao.map((a, i) => `
      <tr style="background:${i % 2 === 0 ? "#fefce8" : "#fff"}">
        <td ${td("font-weight:700")}>${a.itemName}</td>
        <td ${td()}>${a.itemType || "—"}</td>
        <td ${td()}>${a.itemSector || "—"}</td>
        ${a.itemSize ? `<td ${td("text-align:center;font-weight:700")}>${a.itemSize}</td>` : ""}
        <td ${td("text-align:center;font-weight:800;color:#854d0e")}>${a.estoqueAtual}</td>
        <td ${td("text-align:center")}>${a.margemSeguranca}</td>
      </tr>`).join("");

    secaoAtencao = `
      <div style="margin-bottom:24px">
        <div style="background:#854d0e;color:#fff;display:inline-block;padding:5px 14px;border-radius:4px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.5px;margin-bottom:10px">
          🟡 ATENÇÃO — PRÓXIMO DA MARGEM (${alertas.atencao.length})
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th ${th("#854d0e")}>Item</th>
            <th ${th("#854d0e")}>Tipo</th>
            <th ${th("#854d0e")}>Setor</th>
            ${alertas.atencao.some(a => a.itemSize) ? `<th ${thC("#854d0e")}>Tam.</th>` : ""}
            <th ${thC("#854d0e")}>Estoque</th>
            <th ${thC("#854d0e")}>Margem</th>
          </tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>`;
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#f4f4f4;padding:20px">
      <div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        ${headerHiper("Alerta de Estoque", "Hiper Comercial Monlevade — Almoxarifado", `${totalAlertas} item${totalAlertas !== 1 ? "s" : ""}`)}
        <div style="padding:24px 28px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px"><tr>
            <td style="padding:12px 16px;background:#f8f8f8;border:1px solid #eee;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;color:#555">
              Os itens abaixo requerem atenção. Verifique o estoque e realize os pedidos necessários.
            </td>
          </tr></table>

          <!-- KPIs -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px"><tr>
            ${alertas.critico.length > 0 ? `
            <td style="padding:14px;text-align:center;background:#fff5f5;border:2px solid #CC0000;border-radius:6px">
              <div style="font-size:28px;font-weight:800;color:#CC0000;font-family:Arial,sans-serif">${alertas.critico.length}</div>
              <div style="font-size:11px;color:#666;font-family:Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">Crítico</div>
            </td>
            <td style="width:10px"></td>` : ""}
            ${alertas.alerta.length > 0 ? `
            <td style="padding:14px;text-align:center;background:#fffbf0;border:2px solid #b45309;border-radius:6px">
              <div style="font-size:28px;font-weight:800;color:#b45309;font-family:Arial,sans-serif">${alertas.alerta.length}</div>
              <div style="font-size:11px;color:#666;font-family:Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">Abaixo da Margem</div>
            </td>
            <td style="width:10px"></td>` : ""}
            ${alertas.atencao.length > 0 ? `
            <td style="padding:14px;text-align:center;background:#fefce8;border:2px solid #854d0e;border-radius:6px">
              <div style="font-size:28px;font-weight:800;color:#854d0e;font-family:Arial,sans-serif">${alertas.atencao.length}</div>
              <div style="font-size:11px;color:#666;font-family:Arial,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">Atenção</div>
            </td>` : ""}
          </tr></table>

          ${secaoCritico}
          ${secaoAlerta}
          ${secaoAtencao}
        </div>
        ${footerHiper("#CC0000")}
      </div>
    </div>`;

  const ts = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });

  try {
    const info = await transporter.sendMail({
      from: `"Almoxarifado Hiper" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto ? `${assunto} [${ts}]` : `⚠️ Alerta de Estoque — ${totalAlertas} item(ns) [${ts}]`,
      html,
    });
    console.log(`[Email] Alerta enviado — ID: ${info.messageId}`);
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
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric",
  });

  const totalItens = (pedido.items || []).reduce((acc, i) => acc + i.quantity, 0);
  const totalTipos = (pedido.items || []).length;
  const temTamanho = (pedido.items || []).some(i => i.itemSize);

  const itensHtml = (pedido.items || []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#fff"}">
      <td ${td("font-weight:700")}>${item.itemName || "—"}</td>
      ${temTamanho ? `<td ${td("text-align:center;font-weight:700;color:#CC0000")}>${item.itemSize || "—"}</td>` : ""}
      <td ${td("text-align:center;font-weight:800;font-size:15px;color:#CC0000")}>${item.quantity}</td>
      <td ${td("text-align:center")}>
        <span style="background:#fff3cd;color:#856404;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:800;letter-spacing:0.5px">PENDENTE</span>
      </td>
    </tr>`).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#f4f4f4;padding:20px">
      <div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        ${headerHiper("Novo Pedido Registrado", "Hiper Comercial Monlevade — Almoxarifado", `#${pedido.id || "—"}`)}
        <div style="padding:24px 28px">

          <!-- KPIs -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px"><tr>
            <td style="padding:14px 18px;background:#f8f8f8;border:1px solid #eee;border-radius:6px;text-align:center">
              <div style="font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif">Data</div>
              <div style="font-size:13px;font-weight:700;color:#333;font-family:Arial,sans-serif;margin-top:4px">${dataPedido}</div>
            </td>
            <td style="width:10px"></td>
            <td style="padding:14px 18px;background:#f8f8f8;border:1px solid #eee;border-radius:6px;text-align:center">
              <div style="font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif">Fornecedor</div>
              <div style="font-size:13px;font-weight:700;color:#333;font-family:Arial,sans-serif;margin-top:4px">${pedido.supplier || "Não informado"}</div>
            </td>
            <td style="width:10px"></td>
            <td style="padding:14px 18px;background:#fff5f5;border:2px solid #CC0000;border-radius:6px;text-align:center">
              <div style="font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif">Total</div>
              <div style="font-size:26px;font-weight:800;color:#CC0000;font-family:Arial,sans-serif;margin-top:2px">${totalItens}</div>
              <div style="font-size:11px;color:#999;font-family:Arial,sans-serif">${totalTipos} tipo${totalTipos !== 1 ? "s" : ""}</div>
            </td>
          </tr></table>

          ${pedido.notes ? `
          <div style="padding:10px 14px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;color:#555;margin-bottom:20px">
            <strong style="color:#333">Observações:</strong> ${pedido.notes}
          </div>` : ""}

          <!-- Tabela de itens -->
          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px">
            Itens Solicitados
          </div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr>
              <th ${th("#CC0000")}>Item</th>
              ${temTamanho ? `<th ${thC("#CC0000")}>Tamanho</th>` : ""}
              <th ${thC("#CC0000")}>Quantidade</th>
              <th ${thC("#CC0000")}>Status</th>
            </tr></thead>
            <tbody>${itensHtml}</tbody>
            <tfoot>
              <tr style="background:#1A1A1A">
                <td style="padding:11px 14px;font-weight:800;font-family:Arial,sans-serif;font-size:13px;color:#fff;border:1px solid #333">
                  Total — ${totalTipos} tipo${totalTipos !== 1 ? "s" : ""}
                </td>
                ${temTamanho ? `<td style="border:1px solid #333"></td>` : ""}
                <td style="padding:11px 14px;text-align:center;font-weight:800;font-size:20px;color:#CC0000;font-family:Arial,sans-serif;border:1px solid #333">${totalItens}</td>
                <td style="padding:11px 14px;border:1px solid #333"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${footerHiper("#CC0000")}
      </div>
    </div>`;

  const ts = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });

  try {
    const info = await transporter.sendMail({
      from: `"Almoxarifado Hiper" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: `🛒 Pedido #${pedido.id || ""} — ${pedido.supplier || "Sem fornecedor"} · ${totalItens} un. [${ts}]`,
      html,
    });
    console.log(`[Email] Pedido #${pedido.id} enviado — ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[Email] Erro ao enviar email de pedido:", error.message);
  }
}