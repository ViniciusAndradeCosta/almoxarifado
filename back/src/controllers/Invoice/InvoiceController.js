import prisma from "../../database/client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extrairDadosNotaFiscal } from "../../services/invoiceExtractorService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/invoices");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /invoices/upload — recebe o arquivo via multer (req.file) + metadados.
// Se for PDF, tenta extrair automaticamente fornecedor/número/data;
// os campos enviados manualmente pelo usuário sempre têm prioridade.
export async function uploadInvoice(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Nenhum arquivo enviado." });
    }

    const { supplier, invoiceNumber, invoiceDate, notes, stockEntryId } = req.body;
    const filePath = path.join(UPLOAD_DIR, req.file.filename);

    // Extração automática apenas para PDFs
    let extraido = { supplier: null, invoiceNumber: null, invoiceDate: null, confidence: {} };
    if (req.file.mimetype === "application/pdf") {
      extraido = await extrairDadosNotaFiscal(filePath);
    }

    // Campos enviados pelo usuário têm prioridade; senão usa o que foi extraído
    const fornecedorFinal = (supplier && supplier.trim()) || extraido.supplier || null;
    const numeroFinal     = (invoiceNumber && invoiceNumber.trim()) || extraido.invoiceNumber || null;
    const dataFinal       = invoiceDate ? new Date(invoiceDate) : (extraido.invoiceDate ? new Date(extraido.invoiceDate) : null);

    const invoice = await prisma.invoice.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        supplier: fornecedorFinal,
        invoiceNumber: numeroFinal,
        invoiceDate: dataFinal,
        notes: notes || null,
        stockEntryId: stockEntryId ? parseInt(stockEntryId) : null,
      },
    });

    return res.status(201).json({
      success: true,
      invoice,
      extraido: {
        supplier: extraido.supplier,
        invoiceNumber: extraido.invoiceNumber,
        invoiceDate: extraido.invoiceDate,
        confidence: extraido.confidence,
        usouExtracao: {
          supplier: !supplier && !!extraido.supplier,
          invoiceNumber: !invoiceNumber && !!extraido.invoiceNumber,
          invoiceDate: !invoiceDate && !!extraido.invoiceDate,
        },
      },
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(UPLOAD_DIR, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /invoices/extract — apenas extrai os dados SEM salvar, para o frontend
// pré-preencher o formulário antes do usuário confirmar o upload.
export async function extractInvoiceData(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Nenhum arquivo enviado." });
    }

    const filePath = path.join(UPLOAD_DIR, req.file.filename);

    let extraido = { supplier: null, invoiceNumber: null, invoiceDate: null, confidence: {} };
    if (req.file.mimetype === "application/pdf") {
      extraido = await extrairDadosNotaFiscal(filePath);
    }

    // Remove o arquivo temporário — esse endpoint é só para pré-visualização,
    // o upload definitivo acontece em /invoices/upload
    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      supplier: extraido.supplier,
      invoiceNumber: extraido.invoiceNumber,
      invoiceDate: extraido.invoiceDate,
      confidence: extraido.confidence,
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(UPLOAD_DIR, req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.status(500).json({ success: false, error: error.message });
  }
}

// GET /invoices — lista todas as notas fiscais (mais recentes primeiro)
export async function getInvoices(req, res) {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { uploadedAt: "desc" },
      include: { stockEntry: { include: { item: { select: { name: true } } } } },
    });
    return res.json(invoices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET /invoices/:id/download — baixa o arquivo da nota fiscal
export async function downloadInvoice(req, res) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!invoice) return res.status(404).json({ error: "Nota fiscal não encontrada." });

    const filePath = path.join(UPLOAD_DIR, invoice.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo não encontrado no servidor." });

    res.download(filePath, invoice.fileName);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /invoices/:id — remove a nota fiscal (banco + arquivo físico)
export async function deleteInvoice(req, res) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!invoice) return res.status(404).json({ error: "Nota fiscal não encontrada." });

    const filePath = path.join(UPLOAD_DIR, invoice.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.invoice.delete({ where: { id: parseInt(req.params.id) } });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}