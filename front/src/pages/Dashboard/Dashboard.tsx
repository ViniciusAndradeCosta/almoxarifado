import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import api from "../../services/useApi";
import { AllWithdrawal } from "../../types/AllWithdrawal";
import { formatDate } from "../../utils/dateFunctions";
import { IconDownload, IconCalendar, IconBarChart, IconTrendingUp, IconUsers, IconPackage } from "../../components/Icons";
import Papa from "papaparse";

type Periodo = 30 | 90 | 180 | 365;
type ChartType = "bar" | "line";

const PERIODO_LABELS: Record<Periodo, string> = {
  30: "Último mês",
  90: "Últimos 3 meses",
  180: "Últimos 6 meses",
  365: "Este ano",
};

const Dashboard = () => {
  const [withdrawals, setWithdrawals]   = useState<AllWithdrawal[]>([]);
  const [loading, setLoading]           = useState(true);
  const [periodo, setPeriodo]           = useState<Periodo>(90);
  const [showPeriodoMenu, setShowPeriodoMenu] = useState(false);
  const [chartType, setChartType]       = useState<ChartType>("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/getallwithdrawals");
        setWithdrawals(res.data.sort((a: AllWithdrawal, b: AllWithdrawal) =>
          new Date(b.withdrawalDate).getTime() - new Date(a.withdrawalDate).getTime()
        ));
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Filtra pelo período selecionado
  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodo);
    return withdrawals.filter(w => new Date(w.withdrawalDate) >= cutoff);
  }, [withdrawals, periodo]);

  // Gráfico mensal
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(w => {
      const d = new Date(w.withdrawalDate);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      map[key] = (map[key] || 0) + w.quantity;
    });
    return Object.entries(map)
      .map(([month, quantity]) => ({ month, quantity }))
      .sort((a, b) => {
        const [am, ay] = a.month.split("/").map(Number);
        const [bm, by] = b.month.split("/").map(Number);
        return ay !== by ? ay - by : am - bm;
      });
  }, [filtered]);

  // Por setor
  const sectorData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(w => { map[w.itemSector || "—"] = (map[w.itemSector || "—"] || 0) + w.quantity; });
    return Object.entries(map).map(([sector, quantity]) => ({ sector, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filtered]);

  // Por departamento
  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(w => { map[w.employeeDepartment || "—"] = (map[w.employeeDepartment || "—"] || 0) + w.quantity; });
    return Object.entries(map).map(([department, quantity]) => ({ department, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [filtered]);

  // Top itens
  const topItems = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(w => { map[w.itemName] = (map[w.itemName] || 0) + w.quantity; });
    return Object.entries(map).map(([item, quantity]) => ({ item, quantity }))
      .sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [filtered]);

  const totalSaidas    = filtered.reduce((a, w) => a + w.quantity, 0);
  const tiposItens     = new Set(filtered.map(w => w.itemType)).size;
  const departamentos  = new Set(filtered.map(w => w.employeeDepartment)).size;
  const funcionarios   = new Set(filtered.map(w => w.employeeName)).size;

  const handleExport = () => {
    const csv = Papa.unparse(filtered.map(w => ({
      Data: formatDate(w.withdrawalDate),
      Item: w.itemName, Tipo: w.itemType, Setor: w.itemSector,
      Quantidade: w.quantity, Funcionário: w.employeeName,
      Departamento: w.employeeDepartment, Empresa: w.employeeCompany,
    })), { delimiter: ";" });
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dashboard_saidas_${periodo}d.csv`; a.click();
  };

  const BRAND   = "#CC0000";
  const SUCCESS = "#1E8A4C";
  const INFO    = "#1A6FA8";
  const COLORS  = [BRAND, SUCCESS, INFO, "#C98A00", "#6B7280"];

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" };
  const head: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", fontSize: "0.75rem", fontWeight: 700 };
  const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: "0.78rem", color: "var(--text-primary)" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div className="spinner-border" role="status"/>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 2px" }}>
            Dashboard de Saídas
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.73rem", margin: 0 }}>
            {PERIODO_LABELS[periodo]} · {filtered.length} registros
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Período */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowPeriodoMenu(!showPeriodoMenu)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
            >
              <IconCalendar size={13}/> {PERIODO_LABELS[periodo]} ▾
            </button>
            {showPeriodoMenu && (
              <>
                <div onClick={() => setShowPeriodoMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }}/>
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 99, minWidth: 180, overflow: "hidden" }}>
                  {(Object.entries(PERIODO_LABELS) as [string, string][]).map(([val, label]) => (
                    <button key={val} onClick={() => { setPeriodo(Number(val) as Periodo); setShowPeriodoMenu(false); }}
                      style={{ display: "block", width: "100%", padding: "9px 16px", background: periodo === Number(val) ? "var(--brand-subtle)" : "none", color: periodo === Number(val) ? "var(--brand)" : "var(--text-primary)", border: "none", textAlign: "left", fontSize: "0.78rem", fontWeight: periodo === Number(val) ? 700 : 400, cursor: "pointer" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Exportar */}
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            <IconDownload size={13}/> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total de Saídas",   value: totalSaidas,   color: "var(--brand)",   icon: <IconPackage size={18}/> },
          { label: "Tipos de Itens",    value: tiposItens,    color: "var(--success)",  icon: <IconBarChart size={18}/> },
          { label: "Departamentos",     value: departamentos, color: "var(--info)",     icon: <IconTrendingUp size={18}/> },
          { label: "Funcionários",      value: funcionarios,  color: "var(--warning)",  icon: <IconUsers size={18}/> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ ...card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico mensal */}
      <div style={card}>
        <div style={head}>
          <IconBarChart size={13} color="var(--text-muted)"/>
          Saídas por Mês
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {(["bar", "line"] as ChartType[]).map(type => (
              <button key={type} onClick={() => setChartType(type)} style={{
                padding: "3px 12px", borderRadius: 5, border: "none", cursor: "pointer",
                fontSize: "0.7rem", fontWeight: 700,
                background: chartType === type ? "var(--brand)" : "var(--surface-2)",
                color: chartType === type ? "#fff" : "var(--text-secondary)",
              }}>
                {type === "bar" ? "Barras" : "Linha"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 8px" }}>
          <ResponsiveContainer width="100%" height={260}>
            {chartType === "bar" ? (
              <BarChart data={monthlyData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--hover)" }}/>
                <Bar dataKey="quantity" name="Quantidade" fill={BRAND} radius={[4, 4, 0, 0]}/>
              </BarChart>
            ) : (
              <LineChart data={monthlyData} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Line type="monotone" dataKey="quantity" name="Quantidade" stroke={BRAND} strokeWidth={2} dot={{ fill: BRAND, r: 4 }} activeDot={{ r: 6 }}/>
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Setor + Departamento */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Por Setor */}
        <div style={card}>
          <div style={head}><IconBarChart size={13} color="var(--text-muted)"/> Saídas por Setor</div>
          <div style={{ padding: "12px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sectorData} layout="vertical" margin={{ top: 4, right: 20, left: 60, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }}/>
                <YAxis dataKey="sector" type="category" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={55}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--hover)" }}/>
                <Bar dataKey="quantity" name="Quantidade" radius={[0, 4, 4, 0]}>
                  {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Por Departamento */}
        <div style={card}>
          <div style={head}><IconUsers size={13} color="var(--text-muted)"/> Saídas por Departamento</div>
          <div style={{ padding: "12px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 4, right: 20, left: 80, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }}/>
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={75}/>
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--hover)" }}/>
                <Bar dataKey="quantity" name="Quantidade" radius={[0, 4, 4, 0]}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top itens + Últimas saídas */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>

        {/* Top 5 itens */}
        <div style={card}>
          <div style={head}><IconTrendingUp size={13} color="var(--text-muted)"/> Top 5 Itens</div>
          <div style={{ padding: "8px 0" }}>
            {topItems.map((item, i) => (
              <div key={item.item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: i < topItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "var(--brand-subtle)" : "var(--surface-2)", color: i === 0 ? "var(--brand)" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 800, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.76rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item}</div>
                  <div style={{ position: "relative", height: 4, background: "var(--surface-2)", borderRadius: 2, marginTop: 4 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(item.quantity / topItems[0].quantity) * 100}%`, background: i === 0 ? "var(--brand)" : "var(--border)", borderRadius: 2 }}/>
                  </div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.76rem", fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas saídas */}
        <div style={card}>
          <div style={head}>
            <IconPackage size={13} color="var(--text-muted)"/>
            Últimas Saídas
            <Link to="/saidas" style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
              Ver todas →
            </Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Item</th>
                  <th style={{ textAlign: "center" }}>Qtd</th>
                  <th>Setor</th>
                  <th>Funcionário</th>
                  <th>Departamento</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.slice(0, 10).map(w => (
                  <tr key={w.id}>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {formatDate(w.withdrawalDate)}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: "0.78rem" }}>{w.itemName}</td>
                    <td style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.78rem" }}>{w.quantity}</td>
                    <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.itemSector || "—"}</td>
                    <td style={{ fontSize: "0.76rem" }}>{w.employeeName}</td>
                    <td style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{w.employeeDepartment || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;