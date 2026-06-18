import { useEffect, useState } from "react";
import api from "../../services/useApi";
import { formatDate } from "../../utils/dateFunctions";
import {
  IconSearch, IconX, IconCheckCircle, IconTrash, IconArrowRight, IconUsers, IconPackage
} from "../../components/Icons";

interface Employee { id: number; name: string; role: string; department: string; company: string; }
interface Saida {
  id: number; quantity: number; withdrawalDate: string;
  item: { id: number; name: string; type: string; size: string; quantity: number };
}

type Destino = "ESTOQUE" | "DESCARTE";

interface ItemDevolucao {
  saidaId: number;
  itemId: number;
  itemName: string;
  itemSize: string;
  quantidadeOriginal: number;
  quantidadeDevolucao: number;
  destino: Destino;
}

const Devolucao = () => {
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [filteredEmps, setFilteredEmps] = useState<Employee[]>([]);
  const [empSearch, setEmpSearch]       = useState("");
  const [selectedEmp, setSelectedEmp]  = useState<Employee | null>(null);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const [saidas, setSaidas]             = useState<Saida[]>([]);
  const [loadingSaidas, setLoadingSaidas] = useState(false);

  const [itens, setItens]               = useState<ItemDevolucao[]>([]);
  const [saving, setSaving]             = useState(false);
  const [historico, setHistorico]       = useState<any[]>([]);
  const [loadingHist, setLoadingHist]   = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchHistorico();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/getemployees");
      setEmployees(res.data);
    } catch (e) { console.log(e); }
  };

  const fetchHistorico = async () => {
    try {
      setLoadingHist(true);
      const res = await api.get("/getdiscarded");
      setHistorico(res.data);
    } catch (e) { console.log(e); }
    finally { setLoadingHist(false); }
  };

  const fetchSaidasFuncionario = async (empId: number) => {
    try {
      setLoadingSaidas(true);
      const res = await api.get(`/getitemsout/${empId}`);
      setSaidas(res.data || []);
      setItens([]);
    } catch (e) { console.log(e); }
    finally { setLoadingSaidas(false); }
  };

  const handleEmpSearch = (val: string) => {
    setEmpSearch(val);
    setHighlightedIdx(-1);
    setFilteredEmps(val.length > 0
      ? employees.filter(e =>
          e.name.toLowerCase().includes(val.toLowerCase()) ||
          e.department.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 6)
      : []);
  };

  const selectEmp = (emp: Employee) => {
    setSelectedEmp(emp);
    setEmpSearch(emp.name);
    setFilteredEmps([]);
    setHighlightedIdx(-1);
    fetchSaidasFuncionario(emp.id);
  };

  const clearEmp = () => {
    setSelectedEmp(null);
    setEmpSearch("");
    setSaidas([]);
    setItens([]);
  };

  // Adiciona saída à lista de devolução
  const adicionarItem = (saida: Saida) => {
    if (itens.find(i => i.saidaId === saida.id)) return;
    setItens(prev => [...prev, {
      saidaId:            saida.id,
      itemId:             saida.item.id,
      itemName:           saida.item.name,
      itemSize:           saida.item.size || "",
      quantidadeOriginal: saida.quantity,
      quantidadeDevolucao: saida.quantity,
      destino:            "ESTOQUE",
    }]);
  };

  const removerItem = (saidaId: number) => {
    setItens(prev => prev.filter(i => i.saidaId !== saidaId));
  };

  const setQtd = (saidaId: number, qtd: number) => {
    setItens(prev => prev.map(i => i.saidaId === saidaId ? { ...i, quantidadeDevolucao: qtd } : i));
  };

  const setDestino = (saidaId: number, destino: Destino) => {
    setItens(prev => prev.map(i => i.saidaId === saidaId ? { ...i, destino } : i));
  };

  const handleConfirmar = async () => {
    if (!selectedEmp) { window.alert("Selecione um funcionário."); return; }
    if (itens.length === 0) { window.alert("Adicione pelo menos um item."); return; }
    if (itens.some(i => i.quantidadeDevolucao <= 0)) {
      window.alert("Informe quantidades válidas para todos os itens."); return;
    }

    if (!window.confirm(
      `Confirmar devolução de ${itens.length} item(ns) de ${selectedEmp.name}?\n\n` +
      itens.map(i => `• ${i.itemName}${i.itemSize ? ` (${i.itemSize})` : ""} × ${i.quantidadeDevolucao} → ${i.destino === "ESTOQUE" ? "Voltar ao Estoque" : "Descarte"}`).join("\n")
    )) return;

    try {
      setSaving(true);
      for (const item of itens) {
        if (item.destino === "ESTOQUE") {
          // Devolve ao estoque e remove o registro de saída
          await api.delete(`/returnitemandaddquantity/${item.saidaId}`);
        } else {
          // Descarta: remove o registro de saída SEM devolver ao estoque,
          // depois registra o descarte
          await api.delete(`/returnitem/${item.saidaId}`);
          await api.post("/discard", {
            itemId:      item.itemId,
            quantity:    item.quantidadeDevolucao,
            reason:      "Devolução de uniforme — descarte",
            notes:       `Devolvido por ${selectedEmp.name} (${selectedEmp.department})`,
            discardedBy: selectedEmp.name,
            discardDate: new Date().toISOString(),
          });
        }
      }

      window.alert("Devolução registrada com sucesso!");
      setItens([]);
      fetchSaidasFuncionario(selectedEmp.id);
      fetchHistorico();
    } catch (e: any) {
      window.alert(e.response?.data?.error || "Erro ao registrar devolução.");
    } finally { setSaving(false); }
  };

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" };
  const head: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", fontSize: "0.75rem", fontWeight: 700 };
  const lbl: React.CSSProperties  = { fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: 5, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 2px" }}>
          Devolução de Uniforme
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.73rem", margin: 0 }}>
          Registre devoluções de peças — retorno ao estoque ou descarte
        </p>
      </div>

      {/* Layout: formulário + histórico */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16, alignItems: "start" }}>

        {/* ── PAINEL ESQUERDO ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Seleção de funcionário */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={head}>
              <IconUsers size={13} color="var(--brand)"/> Funcionário
            </div>
            <div style={{ padding: "14px 16px" }}>
              <label style={lbl}>Selecione o funcionário que está devolvendo</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
                  <IconSearch size={13}/>
                </div>
                <input
                  className="form-control"
                  value={empSearch}
                  onChange={e => handleEmpSearch(e.target.value)}
                  onKeyDown={e => {
                    if (filteredEmps.length === 0) return;
                    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIdx(p => Math.min(p + 1, filteredEmps.length - 1)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIdx(p => Math.max(p - 1, 0)); }
                    else if (e.key === "Enter") { e.preventDefault(); if (highlightedIdx >= 0) selectEmp(filteredEmps[highlightedIdx]); }
                    else if (e.key === "Escape") { setFilteredEmps([]); }
                  }}
                  placeholder="Buscar por nome ou departamento..."
                  autoComplete="off"
                  style={{ paddingRight: 32 }}
                  disabled={!!selectedEmp}
                />
                {filteredEmps.length > 0 && (
                  <ul style={{ position: "absolute", width: "100%", zIndex: 30, marginTop: 4, padding: 0, listStyle: "none", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    {filteredEmps.map((emp, idx) => (
                      <li key={emp.id}
                        onMouseDown={e => { e.preventDefault(); selectEmp(emp); }}
                        onMouseEnter={() => setHighlightedIdx(idx)}
                        style={{ padding: "8px 12px", cursor: "pointer", background: idx === highlightedIdx ? "var(--brand)" : "transparent", color: idx === highlightedIdx ? "#fff" : "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.78rem" }}>{emp.name}</div>
                        <div style={{ fontSize: "0.68rem", opacity: 0.75 }}>{emp.role} · {emp.department}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedEmp && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--brand-subtle)", border: "1px solid var(--brand)", borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{selectedEmp.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{selectedEmp.role} · {selectedEmp.department}</div>
                  </div>
                  <button onClick={clearEmp} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    <IconX size={14}/>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Itens do funcionário */}
          {selectedEmp && (
            <div style={card}>
              <div style={head}>
                <IconPackage size={13} color="var(--text-muted)"/>
                Uniformes com {selectedEmp.name.split(" ")[0]}
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontWeight: 500, fontSize: "0.68rem" }}>
                  {saidas.length} registro{saidas.length !== 1 ? "s" : ""}
                </span>
              </div>
              {loadingSaidas ? (
                <div style={{ padding: 24, textAlign: "center" }}><div className="spinner-border spinner-border-sm" role="status"/></div>
              ) : saidas.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  Nenhum uniforme registrado para este funcionário.
                </div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {saidas.map(s => {
                    const jaAdicionado = itens.some(i => i.saidaId === s.id);
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", opacity: jaAdicionado ? 0.4 : 1 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                            {s.item?.name}
                            {s.item?.size && <span style={{ marginLeft: 6, fontSize: "0.68rem", fontWeight: 700, color: "var(--brand)" }}>({s.item.size})</span>}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            {formatDate(s.withdrawalDate)} · {s.quantity} un.
                          </div>
                        </div>
                        <button
                          onClick={() => adicionarItem(s)}
                          disabled={jaAdicionado}
                          style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: jaAdicionado ? "var(--surface-2)" : "var(--brand)", color: jaAdicionado ? "var(--text-muted)" : "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: jaAdicionado ? "not-allowed" : "pointer" }}
                        >
                          {jaAdicionado ? "Adicionado" : "+ Devolver"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Lista de devolução */}
          {itens.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <div style={head}>
                <IconArrowRight size={13} color="var(--brand)"/>
                Itens a Devolver
                <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontWeight: 500, fontSize: "0.68rem" }}>{itens.length} item{itens.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {itens.map(item => (
                  <div key={item.saidaId} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                          {item.itemName}
                          {item.itemSize && <span style={{ marginLeft: 6, fontSize: "0.68rem", fontWeight: 700, color: "var(--brand)" }}>({item.itemSize})</span>}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Máx: {item.quantidadeOriginal} un.</div>
                      </div>
                      <button onClick={() => removerItem(item.saidaId)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                        <IconX size={13}/>
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
                      <div>
                        <label style={lbl}>Qtd</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantidadeDevolucao || ""}
                          onChange={e => setQtd(item.saidaId, e.target.value === "" ? 0 : Number(e.target.value))}
                          min={1}
                          max={item.quantidadeOriginal}
                          style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
                        />
                      </div>
                      <div>
                        <label style={lbl}>Destino</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {(["ESTOQUE", "DESCARTE"] as Destino[]).map(d => (
                            <button
                              key={d}
                              onClick={() => setDestino(item.saidaId, d)}
                              style={{
                                padding: "7px 6px", borderRadius: 6, cursor: "pointer",
                                fontSize: "0.7rem", fontWeight: 700,
                                border: `1px solid ${item.destino === d ? (d === "ESTOQUE" ? "var(--success)" : "var(--danger)") : "var(--border)"}`,
                                background: item.destino === d ? (d === "ESTOQUE" ? "var(--success)" : "var(--danger)") : "var(--surface)",
                                color: item.destino === d ? "#fff" : "var(--text-secondary)",
                              }}
                            >
                              {d === "ESTOQUE" ? "✅ Estoque" : "🗑️ Descarte"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleConfirmar}
                  disabled={saving}
                  className="btn btn-primary w-100"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4, padding: 10 }}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm"/>Registrando...</>
                    : <><IconCheckCircle size={14}/> Confirmar Devolução ({itens.length} item{itens.length !== 1 ? "s" : ""})</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── PAINEL DIREITO: Histórico de descartes ── */}
        <div style={card}>
          <div style={head}>
            <IconTrash size={13} color="var(--text-muted)"/>
            Histórico de Devoluções — Descartes
            <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {historico.length} registro{historico.length !== 1 ? "s" : ""}
            </span>
          </div>
          {loadingHist ? (
            <div style={{ padding: 32, textAlign: "center" }}><div className="spinner-border spinner-border-sm" role="status"/></div>
          ) : historico.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              Nenhum descarte registrado.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table table-striped" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Tam.</th>
                    <th style={{ textAlign: "center" }}>Qtd</th>
                    <th>Motivo</th>
                    <th>Descartado por</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((d: any) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{d.item?.name || "—"}</td>
                      <td style={{ fontSize: "0.76rem", color: "var(--brand)", fontWeight: 700 }}>{d.item?.size || "—"}</td>
                      <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{d.quantity}</td>
                      <td style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{d.reason || "—"}</td>
                      <td style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{d.discardedBy || "—"}</td>
                      <td style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(d.discardDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Devolucao;