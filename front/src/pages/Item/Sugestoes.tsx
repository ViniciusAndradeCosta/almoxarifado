import { useEffect, useState } from "react";
import api from "../../services/useApi";
import { IconSearch, IconAlertTriangle, IconCheckCircle } from "../../components/Icons";

interface Sugestao {
    itemId: number;
    itemName: string;
    itemType: string;
    itemSector: string;
    itemSize: string | null;
    estoqueAtual: number;
    margemSeguranca: number;
    totalSaidas: number;
    totalEntradas: number;
    mediaMensalSaida: number;
    mediaMensalEntrada: number;
    coberturaMeses: number;
    estoqueIdeal: number;
    estoqueAlvo: number;
    sugestaoQuantidade: number;
    status: string;
}

interface Alerta {
    itemId: number;
    itemName: string;
    itemType: string;
    itemSector: string;
    itemSize: string | null;
    estoqueAtual: number;
    margemSeguranca: number;
    limiteAtencao: number;
    deficit: number;
    nivel: string;
    mensagem: string;
}

interface AlertasData {
    totalAlertas: number;
    contagem: { critico: number; alerta: number; atencao: number };
    alertas: { critico: Alerta[]; alerta: Alerta[]; atencao: Alerta[] };
}

const Sugestoes = () => {
    const [activeTab, setActiveTab] = useState<"sugestoes" | "alertas" | "margem">("sugestoes");
    const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
    const [alertasData, setAlertasData] = useState<AlertasData | null>(null);
    const [loading, setLoading] = useState(true);

    // Filtros sugestões
    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroNome, setFiltroNome] = useState("");

    // Margem de segurança
    const [margemItemId, setMargemItemId] = useState("");
    const [margemValor, setMargemValor] = useState<number>(0);
    const [margemSetor, setMargemSetor] = useState("");
    const [margemLoteValor, setMargemLoteValor] = useState<number>(0);

    useEffect(() => {
        fetchSugestoes();
        fetchAlertas();
    }, []);

    const fetchSugestoes = async () => {
        try {
            setLoading(true);
            const res = await api.get("/suggestions");
            setSugestoes(res.data.sugestoes || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlertas = async () => {
        try {
            const res = await api.get("/alerts");
            setAlertasData(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            SEM_ESTOQUE: "var(--danger)",
            ABAIXO_MARGEM: "var(--warning)",
            ATENCAO: "var(--info)",
            ESTOQUE_BAIXO: "var(--text-secondary)",
            OK: "var(--success)",
        };
        return colors[status] || "var(--text-secondary)";
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            SEM_ESTOQUE: "Sem Estoque",
            ABAIXO_MARGEM: "Abaixo da Margem",
            ATENCAO: "Atenção",
            ESTOQUE_BAIXO: "Estoque Baixo",
            OK: "OK",
        };
        return labels[status] || status;
    };

    // Filtrar sugestões
    const filteredSugestoes = sugestoes.filter((s) => {
        if (filtroStatus && s.status !== filtroStatus) return false;
        if (filtroNome && !s.itemName.toLowerCase().includes(filtroNome.toLowerCase())) return false;
        return true;
    });

    // Atualizar margem individual
    const handleUpdateMargem = async () => {
        if (!margemItemId) {
            window.alert("Informe o ID do item!");
            return;
        }
        try {
            const res = await api.put(`/item/${margemItemId}/minstock`, { minStock: margemValor });
            if (res.data.success) {
                window.alert(res.data.message);
                fetchSugestoes();
                fetchAlertas();
                setMargemItemId("");
                setMargemValor(0);
            }
        } catch (error: any) {
            window.alert(error.response?.data?.error || "Erro ao atualizar margem.");
        }
    };

    // Atualizar margem em lote
    const handleUpdateMargemLote = async () => {
        if (!margemSetor) {
            window.alert("Informe o setor!");
            return;
        }
        try {
            const res = await api.put("/items/minstock/batch", {
                sector: margemSetor,
                minStock: margemLoteValor,
            });
            if (res.data.success) {
                window.alert(res.data.message);
                fetchSugestoes();
                fetchAlertas();
            }
        } catch (error: any) {
            window.alert(error.response?.data?.error || "Erro ao atualizar margem em lote.");
        }
    };

    // === ESTILOS INLINE ===
    const cardStyle: React.CSSProperties = {
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 24, boxSizing: "border-box"
    };
    const headStyle: React.CSSProperties = {
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "14px 18px", 
        borderBottom: "1px solid var(--border)", background: "var(--surface-2)", boxSizing: "border-box"
    };
    const lblStyle: React.CSSProperties = {
        fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", 
        color: "var(--text-secondary)", marginBottom: 5, display: "block"
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 40, boxSizing: "border-box" }}>
            
            {/* Header da Página */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                <div>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 2px" }}>Sugestões e Alertas</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.73rem", margin: 0 }}>
                        Gerencie a saúde do seu estoque e as sugestões de reposição.
                    </p>
                </div>
            </div>

            {/* Cards resumo de alertas */}
            {alertasData && (
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                    <div style={{ ...cardStyle, flex: 1, minWidth: 120, marginBottom: 0, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Crítico</span>
                        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--danger)", lineHeight: 1.2 }}>{alertasData.contagem.critico}</span>
                    </div>
                    <div style={{ ...cardStyle, flex: 1, minWidth: 120, marginBottom: 0, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Alerta</span>
                        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--warning)", lineHeight: 1.2 }}>{alertasData.contagem.alerta}</span>
                    </div>
                    <div style={{ ...cardStyle, flex: 1, minWidth: 120, marginBottom: 0, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Atenção</span>
                        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--info)", lineHeight: 1.2 }}>{alertasData.contagem.atencao}</span>
                    </div>
                    <div style={{ ...cardStyle, flex: 1, minWidth: 140, marginBottom: 0, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Alertas</span>
                        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>{alertasData.totalAlertas}</span>
                    </div>
                </div>
            )}

            {/* Abas Personalizadas */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 16 }}>
                <button
                    onClick={() => setActiveTab("sugestoes")}
                    style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                        background: activeTab === "sugestoes" ? "var(--brand)" : "var(--surface)",
                        color: activeTab === "sugestoes" ? "#fff" : "var(--text-secondary)",
                        border: activeTab !== "sugestoes" ? "1px solid var(--border)" : "1px solid var(--brand)"
                    }}
                >
                    Sugestões de Pedido
                </button>
                <button
                    onClick={() => setActiveTab("alertas")}
                    style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
                        background: activeTab === "alertas" ? "var(--brand)" : "var(--surface)",
                        color: activeTab === "alertas" ? "#fff" : "var(--text-secondary)",
                        border: activeTab !== "alertas" ? "1px solid var(--border)" : "1px solid var(--brand)"
                    }}
                >
                    Alertas Detalhados
                    {alertasData && alertasData.totalAlertas > 0 && (
                        <span style={{
                            background: activeTab === "alertas" ? "#fff" : "var(--danger)",
                            color: activeTab === "alertas" ? "var(--brand)" : "#fff",
                            padding: "2px 6px", borderRadius: 10, fontSize: "0.65rem", fontWeight: 800
                        }}>
                            {alertasData.totalAlertas}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("margem")}
                    style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                        background: activeTab === "margem" ? "var(--brand)" : "var(--surface)",
                        color: activeTab === "margem" ? "#fff" : "var(--text-secondary)",
                        border: activeTab !== "margem" ? "1px solid var(--border)" : "1px solid var(--brand)"
                    }}
                >
                    Configurar Margem
                </button>
            </div>

            {/* === ABA: SUGESTÕES === */}
            {activeTab === "sugestoes" && (
                <div style={cardStyle}>
                    {/* Header da Tabela com Filtros */}
                    <div style={{ ...headStyle, flexWrap: "wrap", gap: 14 }}>
                        <div style={{ fontWeight: 800, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                            Tabela de Sugestões <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", marginLeft: 4 }}>({filteredSugestoes.length} itens)</span>
                        </div>
                        
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ position: "relative", width: "220px", maxWidth: "100%" }}>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Filtrar por nome..."
                                    value={filtroNome}
                                    onChange={(e) => setFiltroNome(e.target.value)}
                                    style={{ paddingRight: "30px", margin: 0, fontSize: "0.78rem" }} 
                                />
                                <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none", zIndex: 2 }}>
                                    <IconSearch size={14}/>
                                </div>
                            </div>
                            <select
                                className="form-select form-select-sm"
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                style={{ width: "160px", margin: 0, fontSize: "0.78rem" }}
                            >
                                <option value="">Todos os status</option>
                                <option value="SEM_ESTOQUE">Sem Estoque</option>
                                <option value="ABAIXO_MARGEM">Abaixo da Margem</option>
                                <option value="ATENCAO">Atenção</option>
                                <option value="ESTOQUE_BAIXO">Estoque Baixo</option>
                                <option value="OK">OK</option>
                            </select>
                            <button 
                                onClick={fetchSugestoes}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", height: 31 }}
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table className="table table-hover" style={{ margin: 0 }}>
                            <thead style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                                <tr>
                                    <th style={{ paddingLeft: 18 }}>Item</th>
                                    <th>Setor</th>
                                    <th>Estoque</th>
                                    <th>Margem</th>
                                    <th>Média/Mês</th>
                                    <th>Estoque Alvo</th>
                                    <th>Sugestão</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSugestoes.map((s) => (
                                    <tr key={s.itemId}>
                                        <td style={{ paddingLeft: 18, fontSize: "0.78rem", fontWeight: 600 }}>{s.itemName}</td>
                                        <td style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{s.itemSector}</td>
                                        <td style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: s.estoqueAtual === 0 ? "var(--danger)" : "var(--text-primary)" }}>{s.estoqueAtual}</td>
                                        <td style={{ fontSize: "0.78rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>{s.margemSeguranca}</td>
                                        <td style={{ fontSize: "0.74rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)" }}>{s.mediaMensalSaida.toFixed(1)}</td>
                                        <td style={{ fontSize: "0.78rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>{s.estoqueAlvo}</td>
                                        <td style={{ fontSize: "0.78rem", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: s.sugestaoQuantidade > 0 ? "var(--brand)" : "var(--text-muted)" }}>
                                            {s.sugestaoQuantidade > 0 ? `+${s.sugestaoQuantidade}` : "—"}
                                        </td>
                                        <td>
                                            <span style={{ 
                                                fontSize: "0.65rem", fontWeight: 800, padding: "3px 8px", borderRadius: 4, 
                                                background: `${getStatusColor(s.status)}20`,
                                                color: getStatusColor(s.status) 
                                            }}>
                                                {getStatusLabel(s.status).toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSugestoes.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                            Nenhuma sugestão encontrada com estes filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === ABA: ALERTAS DETALHADOS === */}
            {activeTab === "alertas" && alertasData && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {alertasData.totalAlertas === 0 ? (
                        <div style={{ ...cardStyle, padding: 40, textAlign: "center", color: "var(--success)" }}>
                            <IconCheckCircle size={32} />
                            <h5 style={{ marginTop: 12, fontWeight: 700 }}>Nenhum alerta ativo. Estoque saudável!</h5>
                        </div>
                    ) : (
                        <>
                            {alertasData.alertas.critico.length > 0 && (
                                <div style={{ ...cardStyle, borderLeft: "4px solid var(--danger)", marginBottom: 0 }}>
                                    <div style={{ ...headStyle, background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--danger)" }}>
                                        <div style={{ fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                                            <IconAlertTriangle size={15} /> Crítico — Estoque Zerado ({alertasData.alertas.critico.length})
                                        </div>
                                    </div>
                                    <div style={{ padding: "0 18px" }}>
                                        {alertasData.alertas.critico.map((a, i) => (
                                            <div key={a.itemId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < alertasData.alertas.critico.length - 1 ? "1px solid var(--border)" : "none" }}>
                                                <div>
                                                    <strong style={{ fontSize: "0.8rem" }}>{a.itemName}</strong> <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>— {a.itemSector}</span>
                                                </div>
                                                <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "var(--danger)", color: "#fff", padding: "3px 8px", borderRadius: 4 }}>Estoque: {a.estoqueAtual}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {alertasData.alertas.alerta.length > 0 && (
                                <div style={{ ...cardStyle, borderLeft: "4px solid var(--warning)", marginBottom: 0 }}>
                                    <div style={{ ...headStyle, background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--warning)" }}>
                                        <div style={{ fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                                            <IconAlertTriangle size={15} /> Alerta — Abaixo da Margem ({alertasData.alertas.alerta.length})
                                        </div>
                                    </div>
                                    <div style={{ padding: "0 18px" }}>
                                        {alertasData.alertas.alerta.map((a, i) => (
                                            <div key={a.itemId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < alertasData.alertas.alerta.length - 1 ? "1px solid var(--border)" : "none" }}>
                                                <div>
                                                    <strong style={{ fontSize: "0.8rem" }}>{a.itemName}</strong> <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>— {a.itemSector}</span>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{a.mensagem}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "var(--warning)", color: "#000", padding: "3px 8px", borderRadius: 4 }}>Estoque: {a.estoqueAtual}/{a.margemSeguranca}</span>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4, fontWeight: 700 }}>Faltam: {a.deficit}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {alertasData.alertas.atencao.length > 0 && (
                                <div style={{ ...cardStyle, borderLeft: "4px solid var(--info)", marginBottom: 0 }}>
                                    <div style={{ ...headStyle, background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--info)" }}>
                                        <div style={{ fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                                            <IconAlertTriangle size={15} /> Atenção — Próximo da Margem ({alertasData.alertas.atencao.length})
                                        </div>
                                    </div>
                                    <div style={{ padding: "0 18px" }}>
                                        {alertasData.alertas.atencao.map((a, i) => (
                                            <div key={a.itemId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < alertasData.alertas.atencao.length - 1 ? "1px solid var(--border)" : "none" }}>
                                                <div>
                                                    <strong style={{ fontSize: "0.8rem" }}>{a.itemName}</strong> <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>— {a.itemSector}</span>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{a.mensagem}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "var(--info)", color: "#000", padding: "3px 8px", borderRadius: 4 }}>Estoque: {a.estoqueAtual}/{a.margemSeguranca}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* === ABA: CONFIGURAR MARGEM === */}
            {activeTab === "margem" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                    
                    {/* Margem Individual */}
                    <div style={cardStyle}>
                        <div style={headStyle}>
                            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>Margem Individual</div>
                        </div>
                        <div style={{ padding: "16px 18px" }}>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 16 }}>Defina a margem de segurança para um item específico.</p>
                            
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 80 }}>
                                    <label style={lblStyle}>ID do Item</label>
                                    <input type="number" className="form-control" value={margemItemId} onChange={(e) => setMargemItemId(e.target.value)} placeholder="Ex: 1" style={{ fontSize: "0.82rem" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 80 }}>
                                    <label style={lblStyle}>Margem</label>
                                    <input type="number" className="form-control" value={margemValor} onChange={(e) => setMargemValor(Number(e.target.value))} min={0} style={{ fontSize: "0.82rem" }} />
                                </div>
                                <div style={{ width: 100 }}>
                                    <button onClick={handleUpdateMargem} style={{ display: "block", width: "100%", padding: "8px", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", height: 35 }}>
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Margem em Lote */}
                    <div style={cardStyle}>
                        <div style={headStyle}>
                            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>Margem por Setor</div>
                        </div>
                        <div style={{ padding: "16px 18px" }}>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 16 }}>Defina a margem de segurança para todos os itens de um setor.</p>
                            
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 120 }}>
                                    <label style={lblStyle}>Setor</label>
                                    <input type="text" className="form-control" value={margemSetor} onChange={(e) => setMargemSetor(e.target.value.toUpperCase())} placeholder="Ex: LIMPEZA" style={{ fontSize: "0.82rem" }} />
                                </div>
                                <div style={{ width: 80 }}>
                                    <label style={lblStyle}>Margem</label>
                                    <input type="number" className="form-control" value={margemLoteValor} onChange={(e) => setMargemLoteValor(Number(e.target.value))} min={0} style={{ fontSize: "0.82rem" }} />
                                </div>
                                <div style={{ width: 100 }}>
                                    <button onClick={handleUpdateMargemLote} style={{ display: "block", width: "100%", padding: "8px", borderRadius: 6, border: "none", background: "var(--text-primary)", color: "var(--surface)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", height: 35 }}>
                                        Salvar Lote
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de Referência */}
                    <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                        <div style={headStyle}>
                            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>Tabela de Referência Rápida</div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table className="table table-hover" style={{ margin: 0 }}>
                                <thead style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                                    <tr>
                                        <th style={{ paddingLeft: 18, width: 60 }}>ID</th>
                                        <th>Item</th>
                                        <th>Setor</th>
                                        <th>Estoque</th>
                                        <th>Margem Atual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sugestoes.map((s) => (
                                        <tr key={s.itemId}>
                                            <td style={{ paddingLeft: 18, fontSize: "0.74rem", color: "var(--text-muted)" }}>{s.itemId}</td>
                                            <td style={{ fontSize: "0.78rem", fontWeight: 600 }}>{s.itemName}</td>
                                            <td style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{s.itemSector}</td>
                                            <td style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: s.estoqueAtual === 0 ? "var(--danger)" : "var(--text-primary)" }}>{s.estoqueAtual}</td>
                                            <td style={{ fontSize: "0.78rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>{s.margemSeguranca}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Sugestoes;