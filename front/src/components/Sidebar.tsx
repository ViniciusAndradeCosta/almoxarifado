import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useTheme } from "../Auth/ThemeContext";
import api from "../services/useApi";
import {
  IconHome, IconInbox, IconWash, IconPackage,
  IconShoppingCart, IconBell, IconBarChart, IconTrendingUp,
  IconUsers, IconArchive, IconSun, IconMoon, IconLogOut,
  IconChevronDown, IconChevronLeft, IconChevronRight, IconMenu
} from "./Icons";
import "./Sidebar.css";
import logoHiper from "../assets/logo-hiper.png";

const ROUTE_LABELS: Record<string, string> = {
  "/hoje":         "Hoje",
  "/entradas":     "Entrada de Estoque",
  "/lavanderia":   "Lavanderia",
  "/estoque":      "Ver Estoque",
  "/saidas":       "Saídas",
  "/descartados":  "Descartados",
  "/pedidos":      "Pedidos",
  "/sugestoes":    "Alertas",
  "/relatorios":   "Relatórios",
  "/demanda":      "Demanda",
  "/funcionarios": "Funcionários",
  "/armario":      "Armário",
  "/dashboard":    "Dashboard",
};

const MAX_FAVORITOS = 3;
const LS_KEY = "sb_favoritos";

// Ícone de estrela
const IconStar = ({ filled, size = 14 }: { filled: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconClock = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: 0.45 }}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const Sidebar = () => {
  const [collapsed, setCollapsed]     = useState(false);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [alertCount, setAlertCount]   = useState(0);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [favoritos, setFavoritos]     = useState<string[]>([]);
  const [editando, setEditando]       = useState(false);
  const { user, logout }              = useAuth();
  const { theme, toggleTheme }        = useTheme();
  const location                      = useLocation();

  // Carrega favoritos do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setFavoritos(JSON.parse(saved));
    } catch (e) { /* ignora */ }
  }, []);

  // Busca alertas
  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts/count");
      setAlertCount(res.data.total || 0);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    fetchAlerts(); // atualiza badge sempre que navegar
  }, [location])

  const toggle = (menu: string) => setOpenMenu(openMenu === menu ? null : menu);
  const active = (path: string) => location.pathname === path;

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "??";

  const toggleFavorito = (path: string) => {
    setFavoritos(prev => {
      let novo: string[];
      if (prev.includes(path)) {
        // Remove
        novo = prev.filter(p => p !== path);
      } else {
        // Adiciona — máximo 3
        if (prev.length >= MAX_FAVORITOS) {
          window.alert(`Você já tem ${MAX_FAVORITOS} favoritos. Remova um antes de adicionar outro.`);
          return prev;
        }
        novo = [...prev, path];
      }
      localStorage.setItem(LS_KEY, JSON.stringify(novo));
      return novo;
    });
  };

  const isFavorito = (path: string) => favoritos.includes(path);

  // Lista de todas as rotas para o modo edição
  const todasRotas = Object.entries(ROUTE_LABELS);

  return (
    <>
      <button className="sb-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        <IconMenu size={20}/>
      </button>

      {mobileOpen && <div className="sb-overlay" onClick={() => setMobileOpen(false)}/>}

      <aside className={`sb ${collapsed ? "sb--collapsed" : ""} ${mobileOpen ? "sb--open" : ""}`}>

        {/* ── Header ── */}
        <div className="sb-header">
          <div className="sb-brand">
            <img src={logoHiper} alt="Hiper Comercial" className="sb-logo-img"/>
            {!collapsed && (
              <div className="sb-brand-text">
                <span className="sb-brand-name">Hiper Comercial</span>
                <span className="sb-brand-sub">Almoxarifado</span>
              </div>
            )}
          </div>
          <button className="sb-collapse" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <IconChevronRight size={13}/> : <IconChevronLeft size={13}/>}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="sb-nav">

          {/* ── Favoritos ── */}
          {!collapsed && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                <span className="sb-section" style={{ margin: 0 }}>Favoritos</span>
                <button
                  onClick={() => setEditando(!editando)}
                  style={{
                    border: "none", cursor: "pointer", padding: "2px 6px",
                    fontSize: "0.65rem", fontWeight: 700, borderRadius: 4,
                    color: editando ? "var(--brand)" : "var(--text-muted)",
                    background: editando ? "var(--brand-subtle)" : "none",
                  } as React.CSSProperties}
                  title="Editar favoritos"
                >
                  {editando ? "Concluir" : "Editar"}
                </button>
              </div>

              {/* Modo edição: lista todas as rotas com toggle de estrela */}
              {editando ? (
                <div style={{ marginBottom: 4 }}>
                  {todasRotas.map(([path, label]) => (
                    <button
                      key={path}
                      onClick={() => toggleFavorito(path)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "7px 12px", background: "none",
                        border: "none", cursor: "pointer", borderRadius: 6,
                        color: isFavorito(path) ? "var(--brand)" : "var(--text-secondary)",
                        fontSize: "0.78rem", fontWeight: isFavorito(path) ? 700 : 400,
                        textAlign: "left",
                      }}
                    >
                      <span style={{ color: isFavorito(path) ? "var(--brand)" : "var(--text-muted)", flexShrink: 0 }}>
                        <IconStar filled={isFavorito(path)} size={13}/>
                      </span>
                      {label}
                      {isFavorito(path) && (
                        <span style={{ marginLeft: "auto", fontSize: "0.6rem", color: "var(--brand)", fontWeight: 800 }}>
                          FIXO
                        </span>
                      )}
                    </button>
                  ))}
                  <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", padding: "4px 12px 8px", margin: 0 }}>
                    Máximo {MAX_FAVORITOS} favoritos
                  </p>
                </div>
              ) : favoritos.length === 0 ? (
                <button
                  onClick={() => setEditando(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "8px 12px", background: "none",
                    border: "1px dashed var(--border)", cursor: "pointer", borderRadius: 6,
                    color: "var(--text-muted)", fontSize: "0.74rem", marginBottom: 4,
                  }}
                >
                  <IconStar filled={false} size={13}/>
                  Adicionar favoritos...
                </button>
              ) : (
                <div style={{ marginBottom: 4 }}>
                  {favoritos.map(path => (
                    <Link
                      key={path}
                      to={path}
                      className={`sb-link ${active(path) ? "sb-link--active" : ""}`}
                    >
                      <div className="sb-link-icon-wrapper">
                        <IconClock size={16}/>
                      </div>
                      <span className="sb-link-label" style={{ fontSize: "0.78rem" }}>
                        {ROUTE_LABELS[path]}
                      </span>
                      <span style={{
                        marginLeft: "auto", color: "var(--brand)", opacity: 0.5, flexShrink: 0,
                        display: "flex", alignItems: "center",
                      }}>
                        <IconStar filled size={11}/>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {!collapsed && <span className="sb-section">Operação</span>}

          <NavLink to="/hoje"       icon={<IconHome size={20}/>}  label="Hoje"               active={active("/hoje")}       collapsed={collapsed}/>
          <NavLink to="/entradas"   icon={<IconInbox size={20}/>} label="Entrada de Estoque" active={active("/entradas")}   collapsed={collapsed}/>
          <NavLink to="/lavanderia" icon={<IconWash size={20}/>}  label="Lavanderia"          active={active("/lavanderia")} collapsed={collapsed}/>

          {!collapsed && <span className="sb-section">Controle</span>}

          <NavGroup icon={<IconPackage size={20}/>} label="Estoque" id="estoque"
            open={openMenu === "estoque"} collapsed={collapsed} onToggle={() => toggle("estoque")}>
            <SubLink to="/estoque"     label="Ver Estoque" active={active("/estoque")}/>
            <SubLink to="/saidas"      label="Saídas"      active={active("/saidas")}/>
            <SubLink to="/descartados" label="Descartados" active={active("/descartados")}/>
            <SubLink to="/devolucao" label="Devolução" active={active("/devolucao")}/>
          </NavGroup>

          <NavLink to="/pedidos"   icon={<IconShoppingCart size={20}/>} label="Pedidos" active={active("/pedidos")}   collapsed={collapsed}/>
          <NavLink to="/sugestoes" icon={<IconBell size={20}/>}         label="Alertas" active={active("/sugestoes")} collapsed={collapsed} badge={alertCount}/>

          {!collapsed && <span className="sb-section">Gestão</span>}

          <NavGroup icon={<IconBarChart size={20}/>} label="Inteligência" id="intel"
            open={openMenu === "intel"} collapsed={collapsed} onToggle={() => toggle("intel")}>
            <SubLink to="/relatorios" label="Relatórios" active={active("/relatorios")}/>
            <SubLink to="/demanda"    label="Demanda"    active={active("/demanda")}/>
          </NavGroup>

          <NavLink to="/funcionarios" icon={<IconUsers size={20}/>}      label="Funcionários" active={active("/funcionarios")} collapsed={collapsed}/>
          <NavLink to="/armario"      icon={<IconArchive size={20}/>}    label="Armário"      active={active("/armario")}      collapsed={collapsed}/>
          <NavLink to="/dashboard"    icon={<IconTrendingUp size={20}/>} label="Dashboard"    active={active("/dashboard")}    collapsed={collapsed}/>

        </nav>

        {/* ── Footer ── */}
        <div className="sb-footer">
          <button className="sb-theme" onClick={toggleTheme}>
            {theme === "dark" ? <IconSun size={16}/> : <IconMoon size={16}/>}
            {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            {!collapsed && (
              <div className="sb-user-info">
                <span className="sb-user-name">{user?.name}</span>
                <span className="sb-user-role">{user?.role}</span>
              </div>
            )}
            <Link to="/login" className="sb-logout" onClick={logout} title="Sair">
              <IconLogOut size={16}/>
            </Link>
          </div>
        </div>

      </aside>
    </>
  );
};

/* ── Sub-components ── */
interface NavLinkProps {
  to: string; icon: React.ReactNode; label: string;
  active: boolean; collapsed: boolean; badge?: number;
}

const NavLink = ({ to, icon, label, active, collapsed, badge }: NavLinkProps) => (
  <Link to={to} className={`sb-link ${active ? "sb-link--active" : ""}`} title={collapsed ? label : undefined}>
    <div className="sb-link-icon-wrapper">
      {icon}
      {collapsed && badge !== undefined && badge >= 0 && (
        <span className="sb-badge-mini">{badge}</span>
      )}
    </div>
    {!collapsed && <span className="sb-link-label">{label}</span>}
    {!collapsed && badge !== undefined && badge >= 0 && (
      <span className="sb-badge-normal">{badge}</span>
    )}
  </Link>
);

interface NavGroupProps {
  icon: React.ReactNode; label: string; id: string;
  open: boolean; collapsed: boolean; onToggle: () => void; children: React.ReactNode;
}

const NavGroup = ({ icon, label, open, collapsed, onToggle, children }: NavGroupProps) => (
  <div className="sb-group">
    <button className="sb-link sb-link--group" onClick={onToggle}>
      <span className="sb-link-icon-wrapper">{icon}</span>
      {!collapsed && (
        <>
          <span className="sb-link-label">{label}</span>
          <span className={`sb-chevron ${open ? "sb-chevron--open" : ""}`}>
            <IconChevronDown size={12}/>
          </span>
        </>
      )}
    </button>
    {open && !collapsed && <ul className="sb-submenu">{children}</ul>}
  </div>
);

interface SubLinkProps { to: string; label: string; active: boolean; }
const SubLink = ({ to, label, active }: SubLinkProps) => (
  <li>
    <Link to={to} className={`sb-sublink ${active ? "sb-sublink--active" : ""}`}>
      <span className="sb-sublink-dot"/>
      {label}
    </Link>
  </li>
);

export default Sidebar;