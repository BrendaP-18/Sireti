// PAC - PRESENTATION: Mis Reportes (Portal Trabajador)
import { useState, useEffect } from 'react';
import { useLocation }          from 'react-router-dom';
import { reportesService }      from '../../../abstraction/reportes.service';
import { equiposService }       from '../../../abstraction/equipos.service';
import { useAuth }              from '../../../control/AuthContext';

const ESTADOS    = ['Pendiente', 'En proceso', 'Terminado'];
const PRIORIDADES = ['Baja', 'Media', 'Alta'];

function formatFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const chipEstado = (e) => {
  const m = { 'Pendiente': { bg: '#fef3c7', color: '#d97706' }, 'En proceso': { bg: '#dbeafe', color: '#2563eb' }, 'Terminado': { bg: '#d1fae5', color: '#059669' } };
  return m[e] || { bg: '#f3f4f6', color: '#374151' };
};
const chipPrio = (p) => {
  const m = { 'Baja': { bg: '#d1fae5', color: '#059669' }, 'Media': { bg: '#fef3c7', color: '#d97706' }, 'Alta': { bg: '#fee2e2', color: '#dc2626' } };
  return m[p] || { bg: '#f3f4f6', color: '#374151' };
};

export default function MisReportes() {
  const { usuario }   = useAuth();
  const location      = useLocation();
  const preEquipo     = location.state; // { id_equipo, nombre_equipo }

  const [reportes, setReportes] = useState([]);
  const [equipos, setEquipos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [mostrarForm, setMostrarForm] = useState(!!preEquipo);
  const [form, setForm] = useState({
    id_equipo:   preEquipo?.id_equipo || '',
    descripcion: '',
    estado:      'Pendiente',
    prioridad:   'Baja',
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, eRes] = await Promise.all([
        reportesService.getMios(),
        equiposService.getAll(),
      ]);
      setReportes(rRes.data || []);
      setEquipos(eRes.data || []);
    } catch { setReportes([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const enviar = async () => {
    if (!form.descripcion.trim()) return setError('Describe el problema');
    setSaving(true);
    try {
      await reportesService.create({ ...form, id_usuario: usuario.id_usuario });
      setExito('✅ Reporte enviado correctamente');
      setForm({ id_equipo: '', descripcion: '', estado: 'Pendiente', prioridad: 'Baja' });
      setMostrarForm(false);
      setTimeout(() => setExito(''), 3000);
      load();
    } catch (err) { setError(err.response?.data?.error || 'Error al enviar'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-main">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mis Reportes</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Historial y envío de reportes de problemas</p>
        </div>
        <button className="btn btn-primary" style={{ borderRadius: 100, padding: '8px 20px' }}
          onClick={() => { setMostrarForm(v => !v); setError(''); }}>
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo reporte'}
        </button>
      </div>

      {/* ── Mensaje de éxito ── */}
      {exito && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {exito}
        </div>
      )}

      {/* ── Formulario de nuevo reporte ── */}
      {mostrarForm && (
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 16, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 Levantar nuevo reporte
          </h2>

          {error && <div className="login-error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Equipo */}
            <div className="form-group">
              <label className="form-label">Equipo con problema</label>
              <select className="form-control" name="id_equipo" value={form.id_equipo} onChange={handleChange}>
                <option value="">Seleccionar equipo</option>
                {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
              </select>
            </div>

            {/* Prioridad */}
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select className="form-control" name="prioridad" value={form.prioridad} onChange={handleChange}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción del problema</label>
            <textarea className="form-control" name="descripcion" rows={4}
              placeholder="Describe detalladamente el problema que presenta el equipo..."
              value={form.descripcion} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setMostrarForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={enviar} disabled={saving}>
              {saving ? 'Enviando...' : '📤 Enviar reporte'}
            </button>
          </div>
        </div>
      )}

      {/* ── Lista de reportes ── */}
      {loading ? (
        <div className="loading-center"><div className="spinner"></div> Cargando reportes...</div>
      ) : reportes.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 10 }}>No has enviado reportes aún</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Usa el botón "+ Nuevo reporte" para crear uno</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reportes.map(r => {
            const es = chipEstado(r.estado);
            const pr = chipPrio(r.prioridad || 'Baja');
            return (
              <div key={r.id_reporte_trabajador} style={{
                background: '#fff', border: '1px solid var(--border-color)',
                borderRadius: 14, padding: '16px 20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'flex-start', gap: 16,
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                {/* Ícono lateral */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  📋
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                      Reporte #{r.id_reporte_trabajador}
                    </span>
                    <span style={{ background: es.bg, color: es.color, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                      {r.estado}
                    </span>
                    <span style={{ background: pr.bg, color: pr.color, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                      {r.prioridad || 'Baja'}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                    {r.descripcion}
                  </p>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    {r.nombre_equipo && (
                      <span>🖥️ {r.nombre_equipo}</span>
                    )}
                    <span>🕐 {formatFecha(r.fecha)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
