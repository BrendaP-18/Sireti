// PAC - PRESENTATION: Componente Topbar
import { useState } from 'react';
import { useAuth } from '../../control/AuthContext';

export default function Topbar() {
  const { usuario, initiales } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <header className="topbar">
      <div className="topbar-search">
        <svg className="topbar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="topbar-badge"></span>
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">
            {usuario ? initiales(usuario.nombre) : '??'}
          </div>
          <span className="topbar-user-name">
            {usuario?.nombre || 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  );
}
