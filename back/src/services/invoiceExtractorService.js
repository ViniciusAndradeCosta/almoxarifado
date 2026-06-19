import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

// Extrai fornecedor, número da NF e data de emissão de um PDF de DANFE/NF-e.
// Funciona com base em padrões textuais comuns nesse tipo de documento.
// Sempre retorna o que conseguiu achar — campos não encontrados ficam null
// e o usuário pode preencher manualmente.
export async function extrairDadosNotaFiscal(filePath) {
  const resultado = {
    supplier: null,
    invoiceNumber: null,
    invoiceDate: null,
    confidence: {}, // indica o quão confiável foi cada extração, para o front avisar o usuário
  };

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const texto = pdfData.text;

    // Normaliza espaços múltiplos e quebras de linha para facilitar regex
    const textoLimpo = texto.replace(/\s+/g, " ").trim();

    // ── Número da NF-e ──
    // Padrões comuns: "Nº 142", "N° 142", "NF-e Nº 142", "Numero 142"
    const padroesNumero = [
      /N[°ºo]\s*[:\.]?\s*(\d{1,9})\s*S[ée]rie/i,
      /NF-?e\s*N[°ºo]\s*[:\.]?\s*(\d{1,9})/i,
      /N[úu]mero\s*[:\.]?\s*(\d{1,9})/i,
      /N[°ºo]\s*[:\.]?\s*(\d{1,9})/,
    ];
    for (const padrao of padroesNumero) {
      const match = textoLimpo.match(padrao);
      if (match) {
        resultado.invoiceNumber = match[1];
        resultado.confidence.invoiceNumber = "alta";
        break;
      }
    }

    // ── Data de Emissão ──
    // Procura especificamente perto de "DATA DE EMISSÃO" / "Data Emissao"
    const padroesData = [
      /DATA\s*D[EA]\s*EMISS[ÃA]O\s*[:\.]?\s*(\d{2}\/\d{2}\/\d{4})/i,
      /EMISS[ÃA]O\s*[:\.]?\s*(\d{2}\/\d{2}\/\d{4})/i,
    ];
    for (const padrao of padroesData) {
      const match = textoLimpo.match(padrao);
      if (match) {
        const [dia, mes, ano] = match[1].split("/");
        resultado.invoiceDate = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
        resultado.confidence.invoiceDate = "alta";
        break;
      }
    }
    // Fallback: pega a primeira data no formato dd/mm/aaaa do documento
    if (!resultado.invoiceDate) {
      const matchGenerico = textoLimpo.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (matchGenerico) {
        const [dia, mes, ano] = matchGenerico[1].split("/");
        resultado.invoiceDate = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
        resultado.confidence.invoiceDate = "baixa";
      }
    }

    // ── Fornecedor (Razão Social do emitente) ──
    // Estratégia 1: nome de fantasia que aparece antes de "DANFE" (layout padrão Sefaz)
    // Estratégia 2: texto entre "RECEBEMOS DE" e "OS PRODUTOS"
    const padroesFornecedor = [
      /RECEBEMOS\s+DE\s+(.+?)\s+OS\s+PRODUTOS/i,
      /([A-ZÀ-Ú][A-ZÀ-Ú0-9\s\.\-&]{4,60}(?:LTDA|EIRELI|S\/A|S\.A\.|ME|EPP))\s*(?:Rua|Av\.|Avenida|CNPJ)/i,
    ];
    for (const padrao of padroesFornecedor) {
      const match = textoLimpo.match(padrao);
      if (match) {
        resultado.supplier = match[1].trim().replace(/\s+/g, " ");
        resultado.confidence.supplier = "média";
        break;
      }
    }

    resultado.textoCompleto = texto.slice(0, 2000); // guarda um trecho para debug/conferência manual se precisar

    return resultado;
  } catch (error) {
    console.error("[extrairDadosNotaFiscal] Erro ao processar PDF:", error.message);
    // Em caso de erro de parsing, retorna campos vazios sem quebrar o upload
    return resultado;
  }
}