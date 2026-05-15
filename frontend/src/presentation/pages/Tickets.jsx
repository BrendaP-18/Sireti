// PAC - PRESENTATION: Página de Tickets (reportes_trabajador)
import { useState, useEffect } from 'react';
import { reportesService } from '../../abstraction/reportes.service';
import { equiposService }  from '../../abstraction/equipos.service';
import { useAuth } from '../../control/AuthContext';

const ESTADOS = ['Pendiente', 'En proceso', 'Terminado'];

function formatFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Modal({ titulo, datos, onChange, onSave, onClose, equipos, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{titulo}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Equipo</label>
            <select className="form-control" value={datos.id_equipo} onChange={e => onChange({ ...datos, id_equipo: e.target.value })}>
              <option value="">Sin equipo</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" rows={3} value={datos.descripcion}
              onChange={e => onChange({ ...datos, descripcion: e.target.value })} placeholder="Describe el problema..." />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-control" value={datos.estado} onChange={e => onChange({ ...datos, estado: e.target.value })}>
              {ESTADOS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Tickets() {
  const { usuario } = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [equipos, setEquipos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({ id_equipo: '', descripcion: '', estado: 'Pendiente' });
  const [saving, setSaving]     = useState(false);
  const [filtro, setFiltro]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, eRes] = await Promise.all([reportesService.getAll(), equiposService.getAll()]);
      setTickets(tRes.data); setEquipos(eRes.data);
    } catch { setTickets([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const guardar = async () => {
    if (!form.descripcion.trim()) return;
    setSaving(true);
    try {
      if (modal === 'crear') { await reportesService.create({ ...form, id_usuario: usuario.id_usuario }); }
      else { await reportesService.update(selected.id_reporte_trabajador, form); }
      setModal(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este ticket?')) return;
    try { await reportesService.delete(id); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const chipClass = (e) => {
    const m = { 'Pendiente': 'chip pendiente', 'En proceso': 'chip en-proceso', 'Terminado': 'chip terminado' };
    return m[e] || 'chip';
  };

  const filtrados = filtro ? tickets.filter(t => t.estado === filtro) : tickets;

  return (
    <div className="page-main">
      <div className="page-header">
        <h1>Tickets</h1>
        <p>Reportes generados por los trabajadores</p>
      </div>
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">🎫 Tickets ({filtrados.length})</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-control" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
              value={filtro} onChange={e => setFiltro(e.target.value)}>
              <option value="">Todos</option>
              {ESTADOS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button id="btn-nuevo-ticket" className="btn btn-primary"
              onClick={() => { setForm({ id_equipo: '', descripcion: '', estado: 'Pendiente' }); setModal('crear'); }}>
              + Nuevo ticket
            </button>
          </div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner"></div> Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎫</div><p className="empty-state-text">Sin tickets</p></div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Trabajador</th><th>Equipo</th><th>Descripción</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtrados.map(t => (
                <tr key={t.id_reporte_trabajador}>
                  <td style={{ color: '#9ca3af' }}>{t.id_reporte_trabajador}</td>
                  <td style={{ fontWeight: 500 }}>{t.nombre_usuario || '—'}</td>
                  <td style={{ color: '#6b7280' }}>{t.nombre_equipo || '—'}</td>
                  <td><div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div></td>
                  <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{formatFecha(t.fecha)}</td>
                  <td><span className={chipClass(t.estado)}>{t.estado}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-icon"
                        onClick={() => { setSelected(t); setForm({ id_equipo: t.id_equipo, descripcion: t.descripcion, estado: t.estado }); setModal('editar'); }}>✏️</button>
                      <button className="btn btn-danger btn-icon" onClick={() => eliminar(t.id_reporte_trabajador)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {modal && <Modal titulo={modal === 'crear' ? 'Nuevo ticket' : 'Editar ticket'}
        datos={form} onChange={setForm} onSave={guardar} onClose={() => setModal(null)} equipos={equipos} loading={saving} />}
    </div>
  );
}
