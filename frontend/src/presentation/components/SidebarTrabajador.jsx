// PAC - PRESENTATION: Sidebar del Portal Trabajador
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../control/AuthContext';

const IcoEquipo = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const IcoReporte = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IcoChat = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const navItems = [
  { to: '/trabajador/mi-equipo',    icon: <IcoEquipo />,  label: 'Mi Equipo' },
  { to: '/trabajador/mis-reportes', icon: <IcoReporte />, label: 'Mis Reportes' },
  { to: '/trabajador/chat',         icon: <IcoChat />,    label: 'Chat' },
];

export default function SidebarTrabajador() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <span className="sidebar-brand-name">Sireti</span>
      </div>

      {/* Badge de rol */}
      <div style={{ margin: '8px 14px 4px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Portal</div>
        <div style={{ fontSize: 13, color: '#a8d5ba', fontWeight: 600, marginTop: 2 }}>Trabajador</div>
        {usuario && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario.nombre}
          </div>
        )}
      </div>

      <span className="sidebar-menu-label" style={{ marginTop: 10 }}>Menú</span>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <IcoLogout />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
