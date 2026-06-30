import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../services/useApi";
import { AllWithdrawal } from "../../types/AllWithdrawal";
import { IconSearch, IconFilter, IconX, IconTrendingUp, IconShoppingCart } from "../../components/Icons";

interface DemandData {
  itemId: number;
  itemName: string;
  itemType: string;
  itemSector: string;
  totalWithdrawn: number;
  monthlyAverage: number;
  currentStock: number;
  suggestedRestock: number;
}

const DemandPage = () => {
  const [withdrawals, setWithdrawals] = useState<AllWithdrawal[]>([]);
  const [stockData, setStockData]     = useState<{ itemId: number; currentStock: number }[]>([]);
  const [loading, setLoading]         = useState(true);

  const [filterZeroStock, setFilterZeroStock]               = useState(false);
  const [filterNonZeroStock, setFilterNonZeroStock]         = useState(false);
  const [filterSuggestedRestock, setFilterSuggestedRestock] = useState(false);
  const [itemNameFilter, setItemNameFilter]                 = useState("");
  const [itemTypeFilter, setItemTypeFilter]                 = useState("");
  const [itemSectorFilter, setItemSectorFilter]             = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [wRes, sRes] = await Promise.all([
          api.get("/getallwithdrawals"),
          api.get("/getitems"),
        ]);
        setWithdrawals(wRes.data);
        setStockData(sRes.data.map((i: any) => ({ itemId: i.id, currentStock: i.quantity })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const processData = (): DemandData[] => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const map: { [key: number]: { itemName: string; itemType: string; itemSector: string; totalWithdrawn: number } } = {};

    withdrawals
      .filter(w => new Date(w.withdrawalDate) >= ninetyDaysAgo)
      .forEach(w => {
        if (!map[w.itemId]) {
          map[w.itemId] = { itemName: w.itemName, itemType: w.itemType || "", itemSector: w.itemSector || "", totalWithdrawn: 0 };
        }
        map[w.itemId].totalWithdrawn += w.quantity;
      });

    return Object.entries(map).map(([id, data]) => {
      const stock  = stockData.find(s => s.itemId === parseInt(id))?.currentStock ?? 0;
      const avg    = data.totalWithdrawn / 3;
      const isOfc  = ["ESCRITORIO", "LIMPEZA"].includes(data.itemSector);
      const sug    = Math.max(0, isOfc ? avg - stock : avg * 3 - stock);
      return {
        itemId: parseInt(id),
        itemName: data.itemName,
        itemType: data.itemType,
        itemSector: data.itemSector,
        totalWithdrawn: data.totalWithdrawn,
        monthlyAverage: parseFloat(avg.toFixed(2)),
        currentStock: stock,
        suggestedRestock: parseFloat(sug.toFixed(2)),
      };
    });
  };

  const filteredData = useMemo(() => {
    let data = processData();
    if (filterZeroStock)        data = data.filter(i => i.currentStock === 0);
    if (filterNonZeroStock)     data = data.filter(i => i.currentStock > 0);
    if (filterSuggestedRestock) data = data.filter(i => i.suggestedRestock > 0);
    if (itemNameFilter)   data = data.filter(i => i.itemName.toLowerCase().includes(itemNameFilter.toLowerCase()));
    if (itemTypeFilter)   data = data.filter(i => i.itemType.toLowerCase().includes(itemTypeFilter.toLowerCase()));
    if (itemSectorFilter) data = data.filter(i => i.itemSector.toLowerCase().includes(itemSectorFilter.toLowerCase()));
    return data.sort((a, b) => b.suggestedRestock - a.suggestedRestock);
  }, [withdrawals, stockData, filterZeroStock, filterNonZeroStock, filterSuggestedRestock, itemNameFilter, itemTypeFilter, itemSectorFilter]);

  const clearFilters = () => {
    setFilterZeroStock(false); setFilterNonZeroStock(false); setFilterSuggestedRestock(false);
    setItemNameFilter(""); setItemTypeFilter(""); setItemSectorFilter("");
  };

  const hasFilters = filterZeroStock || filterNonZeroStock || filterSuggestedRestock || !!itemNameFilter || !!itemTypeFilter || !!itemSectorFilter;

  const totalSugerido  = filteredData.reduce((a, i) => a + i.suggestedRestock, 0);
  const comSugestao    = filteredData.filter(i => i.suggestedRestock > 0).length;
  const mediaMensal    = filteredData.reduce((a, i) => a + i.monthlyAverage, 0);

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
      <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 2px" }}>
          Análise de Demanda
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.73rem", margin: 0 }}>
          Consumo dos últimos 90 dias · {filteredData.length} item{filteredData.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Itens com sugestão de reposição", value: comSugestao,                     color: comSugestao > 0 ? "var(--brand)" : "var(--success)" },
          { label: "Total sugerido para repor",        value: Math.ceil(totalSugerido) + " un.", color: "var(--info)" },
          { label: "Média de consumo mensal",          value: mediaMensal.toFixed(1) + " un./mês", color: "var(--text-primary)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, padding: "14px 18px" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
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
          {/* Busca por texto */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { label: "Nome", value: itemNameFilter,   set: setItemNameFilter,   placeholder: "Filtrar por nome..." },
              { label: "Tipo", value: itemTypeFilter,   set: setItemTypeFilter,   placeholder: "Filtrar por tipo..." },
              { label: "Setor", value: itemSectorFilter, set: setItemSectorFilter, placeholder: "Filtrar por setor..." },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label style={lbl}>{label}</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
                    <IconSearch size={13}/>
                  </div>
                  <input className="form-control" value={value} onChange={e => set(e.target.value)}
                    placeholder={placeholder} style={{ paddingRight: 32 }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Toggles rápidos */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Estoque zero",        active: filterZeroStock,        onToggle: () => { setFilterZeroStock(!filterZeroStock); setFilterNonZeroStock(false); } },
              { label: "Com estoque",         active: filterNonZeroStock,     onToggle: () => { setFilterNonZeroStock(!filterNonZeroStock); setFilterZeroStock(false); } },
              { label: "Com sugestão",        active: filterSuggestedRestock, onToggle: () => setFilterSuggestedRestock(!filterSuggestedRestock) },
            ].map(({ label, active, onToggle }) => (
              <button key={label} onClick={onToggle} style={{
                padding: "5px 14px", borderRadius: 20, cursor: "pointer",
                fontSize: "0.73rem", fontWeight: 600,
                background: active ? "var(--brand-subtle)" : "var(--surface-2)",
                border: `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
                color: active ? "var(--brand)" : "var(--text-secondary)",
                transition: "all 0.15s",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div style={card}>
        {filteredData.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            <IconTrendingUp size={32} color="var(--border)"/>
            <p style={{ marginTop: 12 }}>Nenhum dado encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <table className="table table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>Setor</th>
                <th style={{ textAlign: "center" }}>Retirado (90d)</th>
                <th style={{ textAlign: "center" }}>Média Mensal</th>
                <th style={{ textAlign: "center" }}>Estoque Atual</th>
                <th style={{ textAlign: "center" }}>Sugestão de Reposição</th>
                <th style={{ textAlign: "center" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => {
                const needsRestock = item.suggestedRestock > 0;
                const stockColor   = item.currentStock === 0 ? "var(--danger)" : item.currentStock <= item.monthlyAverage ? "var(--warning)" : "var(--success)";
                return (
                  <tr key={item.itemId}>
                    <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{item.itemName}</td>
                    <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{item.itemType || "—"}</td>
                    <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{item.itemSector || "—"}</td>
                    <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.82rem" }}>
                      {item.totalWithdrawn}
                    </td>
                    <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem" }}>
                      {item.monthlyAverage}
                    </td>
                    <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.82rem", color: stockColor }}>
                      {item.currentStock}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {needsRestock ? (
                        <span style={{
                          background: "var(--brand-subtle)", color: "var(--brand)",
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.8rem",
                          padding: "3px 10px", borderRadius: 5,
                        }}>
                          {Math.ceil(item.suggestedRestock)} un.
                        </span>
                      ) : (
                        <span style={{ color: "var(--success)", fontSize: "0.75rem", fontWeight: 600 }}>OK</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {needsRestock && (
                        <Link to={`/pedidos?itemId=${item.itemId}&itemName=${encodeURIComponent(item.itemName)}&itemType=${encodeURIComponent(item.itemType || "")}&itemSize=${encodeURIComponent((item as any).itemSize || "")}&qty=${Math.ceil(item.suggestedRestock)}`} style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 5, border: "none",
                          background: "var(--brand)", color: "#fff",
                          fontSize: "0.7rem", fontWeight: 700, textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}>
                          <IconShoppingCart size={11}/> Pedir
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DemandPage;