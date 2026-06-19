import { useEffect, useState, useRef } from "react";
import api from "../../services/useApi";
import { formatDate } from "../../utils/dateFunctions";
import { IconDownload, IconTrash, IconPlus, IconX } from "../../components/Icons";

interface Invoice {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  supplier: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  notes: string | null;
  uploadedAt: string;
  stockEntry?: { item: { name: string } } | null;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (type: string) => type === "application/pdf" ? "📄" : "🖼️";

const NotasFiscais = () => {
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filtroFornecedor, setFiltroFornecedor] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const [file, setFile]           = useState<File | null>(null);
  const [supplier, setSupplier]   = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate]     = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes]         = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]   = useState(false);
  const [extracting, setExtracting]         = useState(false);
  const [extractedNotice, setExtractedNotice] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invoices");
      setInvoices(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleFileSelect = async (f: File | undefined | null) => {
    if (!f) return;
    const tiposPermitidos = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(f.type)) {
      window.alert("Tipo de arquivo não permitido. Use PDF, JPG, PNG ou WEBP.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      window.alert("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    setFile(f);

    // Extração automática apenas para PDFs — pré-preenche o formulário
    if (f.type === "application/pdf") {
      try {
        setExtracting(true);
        const formData = new FormData();
        formData.append("file", f);
        const res = await api.post("/invoices/extract", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          if (res.data.supplier) setSupplier(res.data.supplier);
          if (res.data.invoiceNumber) setInvoiceNumber(res.data.invoiceNumber);
          if (res.data.invoiceDate) setInvoiceDate(res.data.invoiceDate);
          const algoExtraido = res.data.supplier || res.data.invoiceNumber || res.data.invoiceDate;
          if (algoExtraido) setExtractedNotice(true);
        }
      } catch (e) {
        console.log("Extração automática falhou, preenchimento manual disponível:", e);
      } finally {
        setExtracting(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) { window.alert("Selecione um arquivo."); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplier", supplier);
      formData.append("invoiceNumber", invoiceNumber);
      formData.append("invoiceDate", invoiceDate ? new Date(invoiceDate).toISOString() : "");
      formData.append("notes", notes);

      await api.post("/invoices/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      window.alert("Nota fiscal enviada com sucesso!");
      setFile(null); setSupplier(""); setInvoiceNumber(""); setNotes("");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setExtractedNotice(false);
      setShowForm(false);
      fetchInvoices();
    } catch (e: any) {
      window.alert(e.response?.data?.error || "Erro ao enviar nota fiscal.");
    } finally { setUploading(false); }
  };

  const handleDownload = async (inv: Invoice) => {
    try {
      const res = await api.get(`/invoices/${inv.id}/download`, { responseType: "blob" });
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(new Blob([res.data]));
      a.download = inv.fileName;
      a.click();
    } catch (e) { window.alert("Erro ao baixar arquivo."); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Excluir esta nota fiscal? O arquivo será removido permanentemente.")) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (e) { window.alert("Erro ao excluir."); }
  };

  const filtered = invoices.filter(inv =>
    !filtroFornecedor ||
    inv.supplier?.toLowerCase().includes(filtroFornecedor.toLowerCase()) ||
    inv.invoiceNumber?.toLowerCase().includes(filtroFornecedor.toLowerCase()) ||
    inv.fileName.toLowerCase().includes(filtroFornecedor.toLowerCase())
  );

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" };
  const head: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", fontSize: "0.75rem", fontWeight: 700 };
  const lbl: React.CSSProperties  = { fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: 5, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 2px" }}>Notas Fiscais</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.73rem", margin: 0 }}>Armazene e consulte notas fiscais de compras</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: showForm ? "var(--surface-2)" : "var(--brand)", border: showForm ? "1px solid var(--border)" : "none", borderRadius: 7, color: showForm ? "var(--text-secondary)" : "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
          {showForm ? <><IconX size={13}/> Cancelar</> : <><IconPlus size={13}/> Adicionar Nota Fiscal</>}
        </button>
      </div>

      {/* KPI rápido */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Total de Notas</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{invoices.length}</div>
        </div>
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Espaço Utilizado</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: "var(--brand)", lineHeight: 1 }}>
            {formatBytes(invoices.reduce((acc, i) => acc + i.fileSize, 0))}
          </div>
        </div>
        <div style={{ ...card, padding: "14px 18px" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Este Mês</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color: "var(--success)", lineHeight: 1 }}>
            {invoices.filter(i => new Date(i.uploadedAt).getMonth() === new Date().getMonth() && new Date(i.uploadedAt).getFullYear() === new Date().getFullYear()).length}
          </div>
        </div>
      </div>

      {/* Formulário de upload */}
      {showForm && (
        <div style={card}>
          <div style={head}><span>Nova Nota Fiscal</span></div>
          <div style={{ padding: 20 }}>

            {/* Drag and drop / seleção de arquivo */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--brand)" : "var(--border)"}`,
                borderRadius: 10, padding: "32px 20px", textAlign: "center", cursor: "pointer",
                background: dragOver ? "var(--brand-subtle)" : "var(--surface-2)", marginBottom: 18,
                transition: "all 0.15s",
              }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }}
                onChange={e => handleFileSelect(e.target.files?.[0])}/>
              {file ? (
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: 6 }}>{fileIcon(file.type)}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{file.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{formatBytes(file.size)}</div>
                  {extracting && (
                    <div style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span className="spinner-border spinner-border-sm"/> Lendo dados da nota fiscal...
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); setFile(null); setExtractedNotice(false); }} style={{ marginTop: 10, padding: "4px 12px", borderRadius: 5, border: "1px solid var(--danger)", background: "none", color: "var(--danger)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                    Remover
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: 6, opacity: 0.5 }}>📎</div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)" }}>Arraste um arquivo aqui ou clique para selecionar</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>PDF, JPG, PNG ou WEBP · Máximo 10MB</div>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Fornecedor</label>
                <input type="text" className="form-control" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Nome do fornecedor"/>
              </div>
              <div>
                <label style={lbl}>Número da NF</label>
                <input type="text" className="form-control" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Ex: 000123"/>
              </div>
              <div>
                <label style={lbl}>Data da Nota</label>
                <input type="date" className="form-control" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}/>
              </div>
            </div>

            {extractedNotice && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--success-subtle, #e6f7ee)", border: "1px solid var(--success)", borderRadius: 7, fontSize: "0.74rem", color: "var(--success)", display: "flex", alignItems: "center", gap: 8 }}>
                ✓ Dados extraídos automaticamente da nota fiscal. Confira e corrija se necessário.
              </div>
            )}


            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Observações</label>
              <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional"/>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleUpload} disabled={uploading || !file}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 7, border: "none", background: (!file || uploading) ? "var(--surface-2)" : "var(--brand)", color: (!file || uploading) ? "var(--text-muted)" : "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: (!file || uploading) ? "not-allowed" : "pointer" }}>
                {uploading ? <><span className="spinner-border spinner-border-sm"/> Enviando...</> : "Salvar Nota Fiscal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtro */}
      <input type="text" className="form-control" value={filtroFornecedor} onChange={e => setFiltroFornecedor(e.target.value)}
        placeholder="Buscar por fornecedor, número da NF ou nome do arquivo..." style={{ maxWidth: 420 }}/>

      {/* Lista de notas fiscais */}
      <div style={card}>
        <div style={head}>
          <span>Notas Fiscais Cadastradas</span>
          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center" }}><div className="spinner-border spinner-border-sm" role="status"/></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Nenhuma nota fiscal encontrada.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Fornecedor</th>
                  <th>Nº NF</th>
                  <th>Data da Nota</th>
                  <th>Tamanho</th>
                  <th>Enviado em</th>
                  <th style={{ textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1.1rem" }}>{fileIcon(inv.fileType)}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{inv.fileName}</div>
                          {inv.notes && <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{inv.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{inv.supplier || "—"}</td>
                    <td style={{ fontSize: "0.78rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}>{inv.invoiceNumber || "—"}</td>
                    <td style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{inv.invoiceDate ? formatDate(inv.invoiceDate) : "—"}</td>
                    <td style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{formatBytes(inv.fileSize)}</td>
                    <td style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(inv.uploadedAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                        <button onClick={() => handleDownload(inv)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 5, border: "none", background: "#2563EB", color: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                          <IconDownload size={11}/> Baixar
                        </button>
                        <button onClick={() => handleDelete(inv.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 5, border: "none", background: "var(--danger)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                          <IconTrash size={11}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotasFiscais;