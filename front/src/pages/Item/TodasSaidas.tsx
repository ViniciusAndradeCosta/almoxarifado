import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AllWithdrawal } from "../../types/AllWithdrawal";
import api from "../../services/useApi";
import { formatDate } from "../../utils/dateFunctions";
import Papa from "papaparse";
import { IconSearch, IconDownload, IconFilter, IconX } from "../../components/Icons";

const TodasSaidas = () => {
    const navigate = useNavigate();
    const [allWithdrawals, setAllWithdrawals] = useState<AllWithdrawal[]>([]);
    const [filtered, setFiltered]             = useState<AllWithdrawal[]>([]);
    const [loading, setLoading]               = useState(true);

    const [employeeFilter, setEmployeeFilter] = useState("");
    const [itemFilter, setItemFilter]         = useState("");
    const [startDate, setStartDate]           = useState("");
    const [endDate, setEndDate]               = useState("");

    const [currentPage, setCurrentPage]       = useState(1);
    const [itemsPerPage, setItemsPerPage]     = useState(25);

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        applyFilters();
        setCurrentPage(1);
    }, [employeeFilter, itemFilter, startDate, endDate, allWithdrawals]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get("/getallwithdrawals");
            setAllWithdrawals(res.data);
            setFiltered(res.data);
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        let results = [...allWithdrawals];
        if (employeeFilter) results = results.filter(w => w.employeeName?.toLowerCase().includes(employeeFilter.toLowerCase()));
        if (itemFilter)     results = results.filter(w => w.itemName?.toLowerCase().includes(itemFilter.toLowerCase()));
        if (startDate) {
            const start = new Date(startDate);
            results = results.filter(w => new Date(w.withdrawalDate) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59);
            results = results.filter(w => new Date(w.withdrawalDate) <= end);
        }
        setFiltered(results);
    };

    const clearFilters = () => {
        setEmployeeFilter(""); setItemFilter(""); setStartDate(""); setEndDate("");
    };

    const handleExportCSV = () => {
        const csv = Papa.unparse(allWithdrawals.map(w => {
            const d = new Date(w.withdrawalDate);
            return {
                "Data de Saída": `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`,
                "Item": w.itemName,
                "Tipo": w.itemType,
                "Setor": w.itemSector,
                "Tamanho": w.itemSize || "—",
                "Quantidade": w.quantity,
                "Funcionário": w.employeeName,
                "Cargo": w.employeeRole,
                "Empresa": w.employeeCompany,
                "Departamento": w.employeeDepartment,
            };
        }), { delimiter: ";" });
        const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "saidas_almoxarifado.csv"; a.click();
    };

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const pageData   = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const hasFilters = !!(employeeFilter || itemFilter || startDate || endDate);

    const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" };
    const head: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", fontSize: "0.75rem", fontWeight: 700 };
    const lbl: React.CSSProperties  = { fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: 5, display: "block" };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div className="spinner-border" role="status"/>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => navigate(-1)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 5 }}>
                        ← Voltar
                    </button>
                    <div>
                        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 2px" }}>Saídas</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.73rem", margin: 0 }}>
                            {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
                            {hasFilters && <span style={{ color: "var(--brand)", marginLeft: 6 }}>· filtrado</span>}
                        </p>
                    </div>
                </div>
                <button onClick={handleExportCSV} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                    <IconDownload size={13}/> Exportar CSV
                </button>
            </div>

            {/* Filtros */}
            <div style={card}>
                <div style={head}>
                    <IconFilter size={13} color="var(--text-muted)"/>
                    Filtros
                    {hasFilters && (
                        <button onClick={clearFilters} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "3px 10px", cursor: "pointer", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
                            <IconX size={11}/> Limpar
                        </button>
                    )}
                </div>
                <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={lbl}>Funcionário</label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
                                    <IconSearch size={13}/>
                                </div>
                                <input className="form-control" value={employeeFilter}
                                    onChange={e => setEmployeeFilter(e.target.value)}
                                    placeholder="Buscar por funcionário..."
                                    style={{ paddingRight: 32 }}/>
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>Item</label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
                                    <IconSearch size={13}/>
                                </div>
                                <input className="form-control" value={itemFilter}
                                    onChange={e => setItemFilter(e.target.value)}
                                    placeholder="Buscar por item..."
                                    style={{ paddingRight: 32 }}/>
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>Data Inicial</label>
                            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)}/>
                        </div>
                        <div>
                            <label style={lbl}>Data Final</label>
                            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div style={card}>
                {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        {hasFilters ? "Nenhum registro encontrado com os filtros aplicados." : "Nenhuma saída registrada."}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="table table-striped" style={{ margin: 0, minWidth: 900 }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Item</th>
                                    <th>Tipo</th>
                                    <th>Setor</th>
                                    <th>Tam.</th>
                                    <th style={{ textAlign: "center" }}>Qtd</th>
                                    <th>Funcionário</th>
                                    <th>Cargo</th>
                                    <th>Empresa</th>
                                    <th>Departamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map(w => (
                                    <tr key={w.id}>
                                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "var(--text-muted)" }}>{w.id}</td>
                                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.76rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                            {formatDate(w.withdrawalDate)}
                                        </td>
                                        <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{w.itemName}</td>
                                        <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.itemType || "—"}</td>
                                        <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.itemSector || "—"}</td>
                                        <td style={{ fontSize: "0.76rem", color: "var(--brand)", fontWeight: 700 }}>{w.itemSize || "—"}</td>
                                        <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.82rem" }}>{w.quantity}</td>
                                        <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{w.employeeName}</td>
                                        <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.employeeRole || "—"}</td>
                                        <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.employeeCompany || "—"}</td>
                                        <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.employeeDepartment || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Paginação */}
            {filtered.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
                    </span>

                    <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>
                            Anterior
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                            if (page > totalPages) return null;
                            return (
                                <button key={page} onClick={() => setCurrentPage(page)}
                                    style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${currentPage === page ? "var(--brand)" : "var(--border)"}`, background: currentPage === page ? "var(--brand)" : "var(--surface)", color: currentPage === page ? "#fff" : "var(--text-secondary)", fontSize: "0.75rem", fontWeight: currentPage === page ? 700 : 400, cursor: "pointer" }}>
                                    {page}
                                </button>
                            );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}>
                            Próximo
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>Itens por página:</span>
                        <select className="form-select" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            style={{ width: "auto", fontSize: "0.75rem", padding: "4px 8px" }}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodasSaidas;