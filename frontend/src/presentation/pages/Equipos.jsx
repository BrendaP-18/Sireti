// PAC - PRESENTATION: Página de Equipos — Vista de tarjetas con roles
import { useState, useEffect } from 'react';
import { equiposService } from '../../abstraction/equipos.service';
import { soporteService }  from '../../abstraction/soporte.service';
import { useAuth }         from '../../control/AuthContext';
import StatusPanel          from '../components/StatusPanel';
import api from '../../abstraction/api';

/* ── Imagen por tipo de equipo ── */
const imgPorTipo = (tipo) => {
  const t = (tipo || '').toLowerCase();
  if (t.includes('laptop'))     return '/laptop.png';
  if (t.includes('computadora')) return '/laptop.png';
  if (t.includes('proyector'))  return '/laptop.png';
  return '/laptop.png';
};

/* ── Ícono chip de procesador / almacenamiento ── */
const IcoCpu = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const IcoHdd = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="17" cy="12" r="1" fill="currentColor"/>
    <line x1="6" y1="12" x2="12" y2="12"/>
  </svg>
);
const IcoUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/* ── Modal: Registrar / Editar equipo ── */
const TIPOS   = ['Computadora', 'Laptop', 'Impresora', 'Proyector', 'Servidor', 'Tablet', 'Otro'];
const ESTADOS = ['Disponible', 'En uso', 'Mantenimiento'];

function ModalEquipo({ titulo, datos, onChange, onSave, onClose, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{titulo}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre del equipo</label>
            <input className="form-control" placeholder="Ej. Laptop Dell XPS" value={datos.nombre}
              onChange={e => onChange({ ...datos, nombre: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={datos.tipo}
                onChange={e => onChange({ ...datos, tipo: e.target.value })}>
                <option value="">Seleccionar</option>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-control" value={datos.estado}
                onChange={e => onChange({ ...datos, estado: e.target.value })}>
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Procesador (opcional)</label>
              <input className="form-control" placeholder="Ej. Intel i7" value={datos.procesador || ''}
                onChange={e => onChange({ ...datos, procesador: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Almacenamiento (opcional)</label>
              <input className="form-control" placeholder="Ej. 512 GB SSD" value={datos.almacenamiento || ''}
                onChange={e => onChange({ ...datos, almacenamiento: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: Asignar equipo a trabajador ── */
function ModalAsignar({ equipo, onSave, onClose, loading }) {
  const [usuarios, setUsuarios] = useState([]);
  const [idUsuario, setIdUsuario] = useState('');

  useEffect(() => {
    api.get('/usuarios').then(r => setUsuarios(r.data.filter(u => u.rol === 'trabajador')));
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Asignar equipo: {equipo.nombre}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Trabajador</label>
            <select className="form-control" value={idUsuario} onChange={e => setIdUsuario(e.target.value)}>
              <option value="">Seleccionar trabajador</option>
              {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} — {u.area || 'Sin área'}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Al asignar, el estado del equipo cambiará a "En uso".
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(idUsuario)} disabled={loading || !idUsuario}>
            {loading ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal: Ver detalle ── */
function ModalDetalle({ equipo, onClose, esAdmin, onAsignar, onDesasignar }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Detalle del equipo</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <img src={imgPorTipo(equipo.tipo)} alt={equipo.nombre}
            style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Nombre',       equipo.nombre],
              ['Tipo',         equipo.tipo || '—'],
              ['Estado',       equipo.estado],
              ['Procesador',   equipo.procesador || '—'],
              ['Almacenamiento', equipo.almacenamiento || '—'],
              ['Trabajador',   equipo.nombre_trabajador || 'Sin asignar'],
              ['Área',         equipo.area_trabajador || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          {esAdmin && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={onAsignar}>
                👤 Asignar trabajador
              </button>
              {equipo.nombre_trabajador && (
                <button className="btn btn-secondary" onClick={onDesasignar}>
                  Desasignar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════ */
export default function Equipos() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin' || usuario?.rol === 'tecnico';

  const [equipos, setEquipos]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroArea, setFiltroArea] = useState('');

  const [modal, setModal]         = useState(null); // null | 'crear' | 'editar' | 'detalle' | 'asignar'
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState({ nombre: '', tipo: '', estado: 'Disponible', procesador: '', almacenamiento: '' });
  const [saving, setSaving]       = useState(false);

  const [rpStats, setRpStats]     = useState({ pendiente: [], enProceso: [], terminado: [] });

  const load = async () => {
    setLoading(true);
    try {
      const [eqRes, stRes] = await Promise.allSettled([
        equiposService.getAll(),
        soporteService.getStats(),
      ]);
      if (eqRes.status === 'fulfilled') setEquipos(eqRes.value.data || []);
      if (stRes.status === 'fulfilled') {
        const pe = stRes.value.data?.porEstado || [];
        setRpStats({
          pendiente: pe.filter(e => e.estado === 'Pendiente').map(e => `${e.total} equipos pendientes`),
          enProceso: pe.filter(e => e.estado === 'En proceso').map(e => `${e.total} en proceso`),
          terminado: pe.filter(e => e.estado === 'Terminado').map(e => `${e.total} terminados`),
        });
      }
    } catch { setEquipos([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* Listas únicas para filtros */
  const tipos = [...new Set(equipos.map(e => e.tipo).filter(Boolean))];
  const areas = [...new Set(equipos.map(e => e.area_trabajador).filter(Boolean))];

  /* Filtrado */
  const filtrados = equipos.filter(eq => {
    const matchSearch = search === '' ||
      eq.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      eq.nombre_trabajador?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === '' || eq.tipo === filtroTipo;
    const matchArea = filtroArea === '' || eq.area_trabajador === filtroArea;
    return matchSearch && matchTipo && matchArea;
  });

  /* Guardar equipo */
  const guardar = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      if (modal === 'crear') { await equiposService.create(form); }
      else                   { await equiposService.update(selected.id_equipo, form); }
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  /* Eliminar */
  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este equipo? Se quitarán todas sus asignaciones.')) return;
    try { await equiposService.delete(id); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  /* Asignar */
  const asignar = async (id_usuario) => {
    setSaving(true);
    try { await equiposService.asignar(selected.id_equipo, id_usuario); setModal(null); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error al asignar'); }
    finally { setSaving(false); }
  };

  /* Desasignar */
  const desasignar = async () => {
    if (!confirm('¿Quitar la asignación de este equipo?')) return;
    try { await equiposService.desasignar(selected.id_equipo); setModal(null); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  /* Chip estado */
  const chipEstado = (e) => {
    const m = { 'Disponible': '#10b981', 'En uso': '#3b82f6', 'Mantenimiento': '#f59e0b' };
    return m[e] || '#9ca3af';
  };

  return (
    <div className="page-content">
      <div className="page-main">

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              Equipos Registrados
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {esAdmin ? 'Gestión y control de equipos del sistema' : 'Mis equipos asignados'}
            </p>
          </div>
        </div>

        {/* ── Filtros + Búsqueda ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Área */}
          <div style={{ position: 'relative' }}>
            <select className="form-control" style={{ padding: '8px 32px 8px 34px', fontSize: 13, borderRadius: 100 }}
              value={filtroArea} onChange={e => setFiltroArea(e.target.value)}>
              <option value="">Todas las áreas</option>
              {areas.map(a => <option key={a}>{a}</option>)}
            </select>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>👥</span>
          </div>

          {/* Tipo / Categoría */}
          <div style={{ position: 'relative' }}>
            <select className="form-control" style={{ padding: '8px 32px 8px 34px', fontSize: 13, borderRadius: 100 }}
              value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todas las categorías</option>
              {tipos.map(t => <option key={t}>{t}</option>)}
            </select>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🖥️</span>
          </div>

          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Buscar equipo..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--border-color)',
                borderRadius: 100, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fff' }} />
          </div>

          {/* Botón Registrar — solo admin */}
          {esAdmin && (
            <button id="btn-registrar-equipo" className="btn btn-primary"
              style={{ borderRadius: 100, padding: '8px 20px', marginLeft: 'auto' }}
              onClick={() => { setForm({ nombre: '', tipo: '', estado: 'Disponible', procesador: '', almacenamiento: '' }); setModal('crear'); }}>
              + Registrar equipo
            </button>
          )}
        </div>

        {/* ── Grid de tarjetas ── */}
        {loading ? (
          <div className="loading-center"><div className="spinner"></div> Cargando equipos...</div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🖥️</div>
            <p className="empty-state-text">
              {esAdmin ? 'No hay equipos registrados' : 'No tienes equipos asignados'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
            {filtrados.map(eq => (
              <div key={eq.id_equipo} style={{
                background: '#fff', borderRadius: 16,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Imagen */}
                <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: '#f1f5f9' }}>
                  <img src={imgPorTipo(eq.tipo)} alt={eq.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Badge estado */}
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: chipEstado(eq.estado),
                    color: '#fff', borderRadius: 100,
                    padding: '3px 10px', fontSize: 11, fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}>
                    {eq.estado}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {eq.nombre}
                  </div>

                  {/* Trabajador asignado */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-muted)' }}><IcoUser /></span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {eq.nombre_trabajador || 'Sin asignar'}
                    </span>
                  </div>

                  {/* Área */}
                  {eq.area_trabajador && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sidebar-active)', flexShrink: 0 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{eq.area_trabajador}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, marginBottom: 12 }}>
                    {/* Procesador */}
                    {eq.procesador && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}><IcoCpu /></span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{eq.procesador}</span>
                      </div>
                    )}
                    {/* Almacenamiento */}
                    {eq.almacenamiento && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}><IcoHdd /></span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{eq.almacenamiento}</span>
                      </div>
                    )}
                    {/* Tipo si no hay specs */}
                    {!eq.procesador && !eq.almacenamiento && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{eq.tipo || '—'}</span>
                    )}
                  </div>

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary"
                      style={{ flex: 1, fontSize: 12, padding: '6px 8px', borderRadius: 8 }}
                      onClick={() => { setSelected(eq); setModal('detalle'); }}>
                      Ver detalle
                    </button>
                    {esAdmin && (
                      <>
                        <button className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8 }}
                          onClick={() => {
                            setSelected(eq);
                            setForm({ nombre: eq.nombre, tipo: eq.tipo || '', estado: eq.estado, procesador: eq.procesador || '', almacenamiento: eq.almacenamiento || '' });
                            setModal('editar');
                          }}>
                          Editar
                        </button>
                        <button className="btn btn-danger"
                          style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8 }}
                          onClick={() => eliminar(eq.id_equipo)}>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Panel lateral ── */}
      <aside className="page-side">
        <StatusPanel title="Pendientes" items={rpStats.pendiente} color="pendiente" />
        <StatusPanel title="En proceso" items={rpStats.enProceso} color="en-proceso" />
        <StatusPanel title="Terminado"  items={rpStats.terminado} color="terminado" />
      </aside>

      {/* ── Modales ── */}
      {(modal === 'crear' || modal === 'editar') && (
        <ModalEquipo
          titulo={modal === 'crear' ? 'Registrar equipo' : 'Editar equipo'}
          datos={form} onChange={setForm}
          onSave={guardar} onClose={() => setModal(null)} loading={saving}
        />
      )}

      {modal === 'detalle' && selected && (
        <ModalDetalle
          equipo={selected}
          esAdmin={esAdmin}
          onClose={() => setModal(null)}
          onAsignar={() => setModal('asignar')}
          onDesasignar={desasignar}
        />
      )}

      {modal === 'asignar' && selected && (
        <ModalAsignar
          equipo={selected}
          onSave={asignar}
          onClose={() => setModal('detalle')}
          loading={saving}
        />
      )}
    </div>
  );
}
