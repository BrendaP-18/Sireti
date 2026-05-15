// PAC - PRESENTATION: Página de Reportes (soporte_tecnico) — Diseño nuevo
import { useState, useEffect } from 'react';
import { soporteService }   from '../../abstraction/soporte.service';
import { equiposService }   from '../../abstraction/equipos.service';
import { reportesService }  from '../../abstraction/reportes.service';
import StatusPanel           from '../components/StatusPanel';
import { useAuth }           from '../../control/AuthContext';

const ESTADOS    = ['Pendiente', 'En proceso', 'Terminado'];
const PRIORIDADES = ['Baja', 'Media', 'Alta'];

function formatFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ======= Ícono reloj ======= */
const IcoClock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ======= Ícono check ======= */
const IcoCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

/* ======= Modal editar ======= */
function Modal({ datos, onChange, onSave, onClose, equipos, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Editar reporte</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Equipo</label>
            <select className="form-control" value={datos.id_equipo}
              onChange={e => onChange({ ...datos, id_equipo: e.target.value })}>
              <option value="">Sin equipo</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción / Problema</label>
            <textarea className="form-control" rows={3} value={datos.descripcion}
              onChange={e => onChange({ ...datos, descripcion: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-control" value={datos.estado}
                onChange={e => onChange({ ...datos, estado: e.target.value })}>
                {ESTADOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select className="form-control" value={datos.prioridad || 'Baja'}
                onChange={e => onChange({ ...datos, prioridad: e.target.value })}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reportes() {
  const { usuario } = useAuth();

  const [reportes, setReportes]   = useState([]);
  const [equipos, setEquipos]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [modal, setModal]         = useState(false);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState({ id_equipo: '', descripcion: '', estado: 'Pendiente', prioridad: 'Baja' });
  const [saving, setSaving]       = useState(false);
  const [rpStats, setRpStats]     = useState({ pendiente: [], enProceso: [], terminado: [] });

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, eRes, statsRes] = await Promise.allSettled([
        soporteService.getAll(),
        equiposService.getAll(),
        reportesService.getStats(),
      ]);
      if (rRes.status === 'fulfilled') setReportes(rRes.value.data);
      if (eRes.status === 'fulfilled') setEquipos(eRes.value.data);
      if (statsRes.status === 'fulfilled') {
        const pe = statsRes.value.data?.porEstado || [];
        setRpStats({
          pendiente: pe.filter(e => e.estado === 'Pendiente').map(e => `${e.total} reportes pendientes`),
          enProceso: pe.filter(e => e.estado === 'En proceso').map(e => `${e.total} en proceso`),
          terminado: pe.filter(e => e.estado === 'Terminado').map(e => `${e.total} terminados`),
        });
      }
    } catch { setReportes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* Conteos para stat cards */
  const cnt = {
    pendiente: reportes.filter(r => r.estado === 'Pendiente').length,
    proceso:   reportes.filter(r => r.estado === 'En proceso').length,
    terminado: reportes.filter(r => r.estado === 'Terminado').length,
  };

  /* Filtrado */
  const areas = [...new Set(equipos.map(e => e.tipo).filter(Boolean))];
  const filtrados = reportes.filter(r => {
    const matchSearch = search.trim() === '' ||
      r.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      r.nombre_usuario?.toLowerCase().includes(search.toLowerCase()) ||
      r.nombre_equipo?.toLowerCase().includes(search.toLowerCase());
    const matchArea = filtroArea === '' || r.nombre_equipo?.toLowerCase().includes(filtroArea.toLowerCase());
    return matchSearch && matchArea;
  });

  const abrirEditar = (r) => {
    setSelected(r);
    setForm({ id_equipo: r.id_equipo, descripcion: r.descripcion, estado: r.estado, prioridad: r.prioridad || 'Baja' });
    setModal(true);
  };

  const guardar = async () => {
    setSaving(true);
    try {
      await soporteService.update(selected.id_reporte, form);
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este reporte?')) return;
    try { await soporteService.delete(id); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const chipEstado = (e) => {
    const m = { 'Pendiente': 'chip pendiente', 'En proceso': 'chip en-proceso', 'Terminado': 'chip terminado' };
    return m[e] || 'chip';
  };

  const chipPrioridad = (p) => {
    const m = { 'Baja': 'chip baja', 'Media': 'chip media', 'Alta': 'chip alta' };
    return m[p] || 'chip baja';
  };

  return (
    <div className="page-content">
      <div className="page-main">

        {/* ── Header ── */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Reportes de Soporte Técnico</h1>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>

          {/* Pendientes — card oscuro */}
          <div style={{
            background: 'var(--sidebar-bg)', borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 18,
            boxShadow: '0 4px 16px rgba(26,61,43,0.25)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
            }}>
              <IcoClock />
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>Pendientes</div>
              <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>{cnt.pendiente}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Reportes</div>
            </div>
          </div>

          {/* En proceso — card claro */}
          <div style={{
            background: '#fff', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 18,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', flexShrink: 0,
            }}>
              <IcoClock />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>En proceso</div>
              <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>{cnt.proceso}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Reportes</div>
            </div>
          </div>

          {/* Terminados — card claro */}
          <div style={{
            background: '#fff', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 18,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#16a34a', flexShrink: 0,
            }}>
              <IcoCheck />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Terminados</div>
              <div style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>{cnt.terminado}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Reportes</div>
            </div>
          </div>
        </div>

        {/* ── Tabla con filtros ── */}
        <div className="table-card">
          {/* Barra de búsqueda y filtro */}
          <div style={{ display: 'flex', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
              <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="reportes-search"
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 34px',
                  border: '1px solid var(--border-color)', borderRadius: 8,
                  fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif',
                  background: 'var(--bg-main)',
                }}
              />
            </div>

            {/* Filtro área */}
            <select
              id="reportes-filtro-area"
              className="form-control"
              style={{ width: 'auto', padding: '8px 14px', fontSize: 13, minWidth: 140 }}
              value={filtroArea}
              onChange={e => setFiltroArea(e.target.value)}
            >
              <option value="">Area: Todos</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="loading-center"><div className="spinner"></div> Cargando reportes...</div>
          ) : filtrados.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-text">No hay reportes registrados</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipo</th>
                  <th>Problema</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Area</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(r => (
                  <tr key={r.id_reporte}>
                    <td style={{ color: '#9ca3af', fontWeight: 500 }}>#{r.id_reporte}</td>
                    <td style={{ fontWeight: 500 }}>{r.nombre_equipo || '—'}</td>
                    <td>
                      <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={r.descripcion}>
                        {r.descripcion || '—'}
                      </div>
                    </td>
                    <td><span className={chipEstado(r.estado)}>{r.estado}</span></td>
                    <td><span className={chipPrioridad(r.prioridad)}>{r.prioridad || 'Baja'}</span></td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{r.nombre_usuario || '—'}</td>
                    <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{formatFecha(r.fecha)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-icon" title="Editar" onClick={() => abrirEditar(r)}>✏️</button>
                        <button className="btn btn-danger btn-icon" title="Eliminar" onClick={() => eliminar(r.id_reporte)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Panel lateral ── */}
      <aside className="page-side">
        <StatusPanel title="Pendientes" items={rpStats.pendiente} color="pendiente" />
        <StatusPanel title="En proceso" items={rpStats.enProceso} color="en-proceso" />
        <StatusPanel title="Terminado"  items={rpStats.terminado} color="terminado" />
      </aside>

      {/* ── Modal editar ── */}
      {modal && (
        <Modal
          datos={form}
          onChange={setForm}
          onSave={guardar}
          onClose={() => setModal(false)}
          equipos={equipos}
          loading={saving}
        />
      )}
    </div>
  );
}
