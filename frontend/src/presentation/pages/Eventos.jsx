// PAC - PRESENTATION: Calendario de Actividades — Vista semanal
import { useState, useEffect } from 'react';
import { calendarioService } from '../../abstraction/calendario.service';
import { equiposService }    from '../../abstraction/equipos.service';
import StatusPanel            from '../components/StatusPanel';
import { reportesService }   from '../../abstraction/reportes.service';

const DIAS   = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];
const HORAS  = Array.from({ length: 14 }, (_, i) => i + 6); // 06:00 a 19:00
const MESES  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + 1); // lunes
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatRango(lunes) {
  const viernes = new Date(lunes); viernes.setDate(lunes.getDate() + 5);
  return `${lunes.getDate()} ${MESES[lunes.getMonth()]} - ${viernes.getDate()} ${MESES[viernes.getMonth()]}`;
}

/* ── Modal agregar/editar ── */
function Modal({ datos, onChange, onSave, onClose, equipos, loading, titulo }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{titulo}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input className="form-control" placeholder="Ej. Mantenimiento preventivo"
              value={datos.descripcion} onChange={e => onChange({ ...datos, descripcion: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Equipo</label>
            <select className="form-control" value={datos.id_equipo}
              onChange={e => onChange({ ...datos, id_equipo: e.target.value })}>
              <option value="">Sin equipo</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha y hora</label>
            <input type="datetime-local" className="form-control" value={datos.fecha}
              onChange={e => onChange({ ...datos, fecha: e.target.value })} />
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

export default function Eventos() {
  const hoy    = new Date();
  const [semana,   setSemana]   = useState(startOfWeek(hoy));
  const [eventos,  setEventos]  = useState([]);
  const [equipos,  setEquipos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ descripcion: '', id_equipo: '', fecha: '' });
  const [rpStats,  setRpStats]  = useState({ pendiente: [], enProceso: [], terminado: [] });

  const load = async () => {
    setLoading(true);
    try {
      const [evRes, eqRes, stRes] = await Promise.allSettled([
        calendarioService.getAll(),
        equiposService.getAll(),
        reportesService.getStats(),
      ]);
      if (evRes.status === 'fulfilled') setEventos(evRes.value.data || []);
      if (eqRes.status === 'fulfilled') setEquipos(eqRes.value.data || []);
      if (stRes.status === 'fulfilled') {
        const pe = stRes.value.data?.porEstado || [];
        setRpStats({
          pendiente: pe.filter(e => e.estado === 'Pendiente').map(e => `${e.total} pendientes`),
          enProceso: pe.filter(e => e.estado === 'En proceso').map(e => `${e.total} en proceso`),
          terminado: pe.filter(e => e.estado === 'Terminado').map(e => `${e.total} terminados`),
        });
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Días de la semana actual (lunes a sábado)
  const diasSemana = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(semana); d.setDate(semana.getDate() + i); return d;
  });

  const navSemana = (dir) => {
    const d = new Date(semana); d.setDate(d.getDate() + dir * 7); setSemana(d);
  };

  const toInputDate = (f) => {
    if (!f) return '';
    const d = new Date(f);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const abrirCrear = (diaDate, hora) => {
    const f = new Date(diaDate);
    f.setHours(hora || 8, 0, 0, 0);
    setSelected(null);
    setForm({ descripcion: '', id_equipo: '', fecha: toInputDate(f) });
    setModal(true);
  };

  const abrirEditar = (ev, e) => {
    e.stopPropagation();
    setSelected(ev);
    setForm({ descripcion: ev.descripcion, id_equipo: ev.id_equipo || '', fecha: toInputDate(ev.fecha) });
    setModal(true);
  };

  const guardar = async () => {
    if (!form.descripcion.trim() || !form.fecha) return;
    setSaving(true);
    try {
      if (selected) { await calendarioService.update(selected.id_actividad, form); }
      else           { await calendarioService.create(form); }
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const eliminar = async (ev, e) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta actividad?')) return;
    try { await calendarioService.delete(ev.id_actividad); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  // Eventos de un día y hora específica
  const eventosEn = (dia, hora) => {
    return eventos.filter(ev => {
      if (!ev.fecha) return false;
      const d = new Date(ev.fecha);
      return sameDay(d, dia) && d.getHours() === hora;
    });
  };

  // Colores de eventos
  const COLORES = ['#2d6a4f','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
  const colorEvento = (id) => COLORES[id % COLORES.length];

  return (
    <div className="page-content">
      <div className="page-main" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Calendario de Actividades</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Gestión de actividades y mantenimientos</p>
        </div>

        {/* ── Controles ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Navegación */}
          <button className="btn btn-secondary" style={{ borderRadius: 100, padding: '6px 16px', fontSize: 13 }}
            onClick={() => navSemana(-1)}>
            Anterior
          </button>

          <div style={{
            background: 'var(--sidebar-bg)', color: '#fff',
            borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 600,
          }}>
            {formatRango(semana)}
          </div>

          <button className="btn btn-secondary" style={{ borderRadius: 100, padding: '6px 16px', fontSize: 13 }}
            onClick={() => navSemana(1)}>
            Siguiente
          </button>

          <button id="btn-agregar-actividad" className="btn btn-primary"
            style={{ borderRadius: 100, padding: '6px 18px', fontSize: 13, marginLeft: 8 }}
            onClick={() => abrirCrear(hoy, 8)}>
            + Agregar actividad
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary"
              style={{ borderRadius: 100, padding: '6px 14px', fontSize: 13 }}
              onClick={() => setSemana(startOfWeek(hoy))}>
              Hoy
            </button>
            <button className="btn btn-secondary"
              style={{ borderRadius: 100, padding: '6px 14px', fontSize: 13, background: 'var(--sidebar-active)', color: '#fff', border: 'none' }}>
              Semana
            </button>
          </div>
        </div>

        {/* ── Grilla del Calendario ── */}
        <div style={{
          flex: 1, background: '#fff', borderRadius: 16,
          border: '1px solid var(--border-color)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Cabecera de días */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(6, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ borderRight: '1px solid var(--border-color)' }}></div>
            {diasSemana.map((dia, i) => {
              const esHoy = sameDay(dia, hoy);
              return (
                <div key={i} style={{
                  padding: '10px 8px', textAlign: 'center',
                  background: esHoy ? 'var(--sidebar-bg)' : '#fff',
                  borderRight: i < 5 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: esHoy ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {DIAS[dia.getDay()]}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: esHoy ? '#fff' : 'var(--text-primary)', marginTop: 2 }}>
                    {pad(dia.getDate())}/{pad(dia.getMonth()+1)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filas de horas */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {HORAS.map(hora => (
              <div key={hora} style={{ display: 'grid', gridTemplateColumns: '56px repeat(6, 1fr)', minHeight: 64, borderBottom: '1px solid var(--border-color)' }}>
                {/* Hora */}
                <div style={{
                  padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
                  borderRight: '1px solid var(--border-color)', textAlign: 'right',
                  paddingTop: 6,
                }}>
                  {pad(hora)}:00
                </div>

                {/* Celdas por día */}
                {diasSemana.map((dia, i) => {
                  const esHoy = sameDay(dia, hoy);
                  const evs   = eventosEn(dia, hora);
                  return (
                    <div key={i}
                      onClick={() => abrirCrear(dia, hora)}
                      style={{
                        borderRight: i < 5 ? '1px solid var(--border-color)' : 'none',
                        background: esHoy ? 'rgba(26,61,43,0.03)' : 'transparent',
                        cursor: 'pointer', padding: '3px',
                        position: 'relative', minHeight: 64,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!evs.length) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = esHoy ? 'rgba(26,61,43,0.03)' : 'transparent'; }}
                    >
                      {evs.map(ev => (
                        <div key={ev.id_actividad}
                          style={{
                            background: colorEvento(ev.id_actividad),
                            color: '#fff', borderRadius: 8,
                            padding: '4px 8px', fontSize: 11, fontWeight: 600,
                            marginBottom: 2, cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            lineHeight: 1.4,
                          }}
                          onClick={e => abrirEditar(ev, e)}
                        >
                          <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.descripcion}
                          </div>
                          {ev.nombre_equipo && (
                            <div style={{ opacity: 0.85, fontSize: 10 }}>{ev.nombre_equipo}</div>
                          )}
                          <button
                            onClick={e => eliminar(ev, e)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 10, padding: 0, marginTop: 2 }}>
                            ✕ eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel lateral ── */}
      <aside className="page-side">
        <StatusPanel title="Pendientes" items={rpStats.pendiente} color="pendiente" />
        <StatusPanel title="En proceso" items={rpStats.enProceso} color="en-proceso" />
        <StatusPanel title="Terminado"  items={rpStats.terminado} color="terminado" />
      </aside>

      {/* ── Modal ── */}
      {modal && (
        <Modal
          titulo={selected ? 'Editar actividad' : 'Agregar actividad'}
          datos={form} onChange={setForm}
          onSave={guardar} onClose={() => setModal(false)}
          equipos={equipos} loading={saving}
        />
      )}
    </div>
  );
}
