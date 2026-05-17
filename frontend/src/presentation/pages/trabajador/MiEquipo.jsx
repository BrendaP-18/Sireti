// PAC - PRESENTATION: Mi Equipo (Portal Trabajador)
import { useState, useEffect } from 'react';
import { equiposService } from '../../../abstraction/equipos.service';
import { useAuth }        from '../../../control/AuthContext';
import { useNavigate }    from 'react-router-dom';

const IcoCpu = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const IcoHdd = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="17" cy="12" r="1" fill="currentColor"/>
    <line x1="6" y1="12" x2="12" y2="12"/>
  </svg>
);

const chipColor = (e) => {
  if (e === 'Disponible')   return { bg: '#d1fae5', color: '#065f46' };
  if (e === 'En uso')       return { bg: '#dbeafe', color: '#1e40af' };
  if (e === 'Mantenimiento') return { bg: '#fef3c7', color: '#92400e' };
  return { bg: '#f3f4f6', color: '#374151' };
};

export default function MiEquipo() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    equiposService.getAll()
      .then(r => setEquipos(r.data || []))
      .catch(() => setEquipos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-main">
      <div className="page-header">
        <h1>Mi Equipo Asignado</h1>
        <p>Equipos que tienes asignados actualmente</p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div> Cargando...</div>
      ) : equipos.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div style={{ fontSize: 64 }}>🖥️</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 12 }}>
            No tienes equipos asignados
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Contacta a tu administrador para que te asigne un equipo
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {equipos.map(eq => {
            const chip = chipColor(eq.estado);
            return (
              <div key={eq.id_equipo} style={{
                background: '#fff', borderRadius: 20,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              >
                {/* Imagen */}
                <div style={{ height: 180, background: 'linear-gradient(135deg, #1a3d2b 0%, #2d6a4f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img src="/laptop.png" alt={eq.nombre}
                    style={{ width: '75%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }} />
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: chip.bg, color: chip.color,
                    borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                  }}>
                    {eq.estado}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {eq.nombre}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    {eq.tipo || 'Equipo de cómputo'}
                  </div>

                  {/* Specs */}
                  <div style={{ background: 'var(--bg-main)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {eq.procesador && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--sidebar-active)' }}><IcoCpu /></span>
                        <span style={{ color: 'var(--text-secondary)' }}>{eq.procesador}</span>
                      </div>
                    )}
                    {eq.almacenamiento && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--sidebar-active)' }}><IcoHdd /></span>
                        <span style={{ color: 'var(--text-secondary)' }}>{eq.almacenamiento}</span>
                      </div>
                    )}
                    {!eq.procesador && !eq.almacenamiento && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin especificaciones registradas</span>
                    )}
                  </div>

                  {/* Botón levantar reporte */}
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '10px', fontSize: 14 }}
                    onClick={() => navigate('/trabajador/mis-reportes', { state: { id_equipo: eq.id_equipo, nombre_equipo: eq.nombre } })}
                  >
                    📋 Levantar reporte
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
