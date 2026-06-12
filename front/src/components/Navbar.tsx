import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { useAuth } from '../Auth/AuthContext';
import api from '../services/useApi';

const Navbar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLUListElement>(null);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const logout = useAuth().logout;

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const closeAll = () => {
        setMobileMenuOpen(false);
        setOpenDropdown(null);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await api.get('/alerts/count');
                setAlertCount(res.data.total || 0);
            } catch (error) {
                console.log(error);
            }
        };
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className='d-flex justify-content-center navbar2'>
            <div className={`navbar-mobile-button ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul ref={navRef} className={`navbar-list ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Estoque */}
                <li className="position-relative">
                    <a href="#" onClick={(e) => { e.preventDefault(); toggleDropdown("estoque"); }}>
                        Estoque ▾
                    </a>
                    {openDropdown === "estoque" && (
                        <ul className="dropdown-menu show" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1050 }}>
                            <li><Link to="/estoque" className="dropdown-item" onClick={closeAll}>Ver Estoque</Link></li>
                            <li><Link to="/entradas" className="dropdown-item" onClick={closeAll}>Entradas</Link></li>
                            <li><Link to="/saidas" className="dropdown-item" onClick={closeAll}>Saídas</Link></li>
                            <li><Link to="/descartados" className="dropdown-item" onClick={closeAll}>Descartados</Link></li>
                            <li><Link to="/lavanderia" className="dropdown-item" onClick={closeAll}>Lavanderia</Link></li>
                        </ul>
                    )}
                </li>

                {/* Pedidos */}
                <li><Link to="/pedidos" onClick={closeAll}>Pedidos</Link></li>

                {/* Inteligência */}
                <li className="position-relative">
                    <a href="#" onClick={(e) => { e.preventDefault(); toggleDropdown("inteligencia"); }}>
                        Inteligência ▾
                    </a>
                    {openDropdown === "inteligencia" && (
                        <ul className="dropdown-menu show" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1050 }}>
                            <li><Link to="/relatorios" className="dropdown-item" onClick={closeAll}>Relatórios</Link></li>
                            <li><Link to="/demanda" className="dropdown-item" onClick={closeAll}>Demanda</Link></li>
                        </ul>
                    )}
                </li>

                {/* Alertas (separado, fora do dropdown) */}
                <li>
                    <Link to="/sugestoes" onClick={closeAll}>
                        Alertas {alertCount > 0 && <span className="badge bg-danger ms-1" style={{ fontSize: '0.7em' }}>{alertCount}</span>}
                    </Link>
                </li>

                {/* Funcionários */}
                <li className="position-relative">
                    <a href="#" onClick={(e) => { e.preventDefault(); toggleDropdown("funcionarios"); }}>
                        Funcionários ▾
                    </a>
                    {openDropdown === "funcionarios" && (
                        <ul className="dropdown-menu show" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1050 }}>
                            <li><Link to="/funcionarios" className="dropdown-item" onClick={closeAll}>Ver Funcionários</Link></li>
                            <li><Link to="/cadastrarfuncionario" className="dropdown-item" onClick={closeAll}>Cadastrar</Link></li>
                            <li><Link to="/funcionarios/new" className="dropdown-item" onClick={closeAll}>Novos</Link></li>
                        </ul>
                    )}
                </li>

                {/* Armário */}
                <li><Link to="/armario" onClick={closeAll}>Armário</Link></li>

                {/* Dashboard */}
                <li><Link to="/dashboard" onClick={closeAll}>Dashboard</Link></li>
            </ul>
            <div className="user-actions">
                <span>Olá, {useAuth().user?.name}</span>
                <button className='btn btn-danger'>
                    <Link to="/login" className='btn' onClick={logout}>Sair</Link>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;