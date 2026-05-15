// PAC - PRESENTATION: Dashboard (Inicio)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../control/AuthContext';
import StatCard    from '../components/StatCard';
import StatusPanel from '../components/StatusPanel';
import { equiposService }   from '../../abstraction/equipos.service';
import { soporteService }   from '../../abstraction/soporte.service';
import { calendarioService } from '../../abstraction/calendario.service';
import { reportesService }  from '../../abstraction/reportes.service';

function formatFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();

  const [stats,           setStats]           = useState({ equipos: 0, soporte: 0, tickets: 0, eventos: 0 });
  const [ticketsRecientes, setTicketsRecientes] = useState([]);
  const [eventosProximos,  setEventosProximos]  = useState([]);
  const [reporteStats,    setReporteStats]    = useState({ pendiente: [], enProceso: [], terminado: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eqRes, stRes, evRes, rpRes, rpStats] = await Promise.allSettled([
          equiposService.getAll(),
          soporteService.getRecientes(5),
          calendarioService.getProximos(5),
          soporteService.getStats(),
          reportesService.getStats(),
        ]);

        const eqData  = eqRes.status  === 'fulfilled' ? eqRes.value.data  : [];
        const stData  = stRes.status  === 'fulfilled' ? stRes.value.data  : [];
        const evData  = evRes.status  === 'fulfilled' ? evRes.value.data  : [];
        const rpData  = rpRes.status  === 'fulfilled' ? rpRes.value.data  : { total: 0 };
        const rpSData = rpStats.status === 'fulfilled' ? rpStats.value.data : { porEstado: [] };

        // Tickets pendientes en soporte_tecnico
        const pendientes = rpData?.porEstado?.find(e => e.estado === 'Pendiente')?.total || 0;

        setStats({
          equipos:  Array.isArray(eqData) ? eqData.length : 0,
          soporte:  rpData?.total || 0,
          tickets:  parseInt(pendientes),
          eventos:  Array.isArray(evData) ? evData.length : 0,
        });

        setTicketsRecientes(Array.isArray(stData) ? stData : []);
        setEventosProximos(Array.isArray(evData) ? evData : []);

        // Panel lateral de reportes_trabajador
        const pe = rpSData?.porEstado || [];
        setReporteStats({
          pendiente: pe.filter(e => e.estado === 'Pendiente').map(e => `${e.total} reportes pendientes`),
          enProceso: pe.filter(e => e.estado === 'En proceso').map(e => `${e.total} en proceso`),
          terminado: pe.filter(e => e.estado === 'Terminado').map(e => `${e.total} terminados`),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getChipClass = (estado) => {
    if (!estado) return '';
    const e = estado.toLowerCase();
    if (e === 'pendiente') return 'chip pendiente';
    if (e === 'en proceso') return 'chip en-proceso';
    if (e === 'terminado') return 'chip terminado';
    if (e === 'baja') return 'chip baja';
    if (e === 'media') return 'chip media';
    if (e === 'alta') return 'chip alta';
    return 'chip';
  };

  return (
    <div className="page-content">
      <div className="page-main">
        {/* Header */}
        <div className="page-header">
          <h1>Bienvenido, {usuario?.nombre || 'Usuario'}</h1>
          <p>Panel de control de soporte técnico</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard label="Equipos"  value={stats.equipos} sub="Total registrados"  icon="🖥️" type="equipos" />
          <StatCard label="Reportes" value={stats.soporte} sub="Soporte técnico"    icon="📋" type="reportes" />
          <StatCard label="Tickets"  value={stats.tickets} sub="Pendientes"         icon="⚠️" type="tickets" />
          <StatCard label="Eventos"  value={stats.eventos} sub="Próximos"           icon="📅" type="eventos" />
        </div>

        {/* Secciones: Tickets + Eventos */}
        <div className="section-grid">
          {/* Tickets Recientes */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="section-card-title">
                <span>⚠️</span> Tickets Recientes
              </div>
              <button className="section-card-link" onClick={() => navigate('/tickets')}>
                Ver más <span>›</span>
              </button>
            </div>
            {loading ? (
              <div className="loading-center"><div className="spinner"></div> Cargando...</div>
            ) : ticketsRecientes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎫</div>
                <p className="empty-state-text">Sin tickets recientes</p>
              </div>
            ) : (
              ticketsRecientes.map(t => (
                <div key={t.id_reporte} className="section-item">
                  <div className="section-item-info">
                    <div className="section-item-title">{t.descripcion}</div>
                    <div className="section-item-meta">{t.nombre_usuario} – {formatFecha(t.fecha || new Date())}</div>
                  </div>
                  <span className={getChipClass(t.estado)}>{t.estado}</span>
                </div>
              ))
            )}
          </div>

          {/* Eventos Próximos */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="section-card-title">
                <span>📅</span> Eventos Próximos
              </div>
              <button className="section-card-link" onClick={() => navigate('/eventos')}>
                Ver más <span>›</span>
              </button>
            </div>
            {loading ? (
              <div className="loading-center"><div className="spinner"></div> Cargando...</div>
            ) : eventosProximos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <p className="empty-state-text">Sin eventos próximos</p>
              </div>
            ) : (
              eventosProximos.map(ev => (
                <div key={ev.id_actividad} className="section-item">
                  <div className="section-item-info">
                    <div className="section-item-title">{ev.descripcion}</div>
                    <div className="section-item-meta">{ev.nombre_equipo}</div>
                  </div>
                  <span className="date-chip">{formatFecha(ev.fecha)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel lateral de estados */}
      <aside className="page-side">
        <StatusPanel title="Pendientes"  items={reporteStats.pendiente} color="pendiente" />
        <StatusPanel title="En proceso"  items={reporteStats.enProceso} color="en-proceso" />
        <StatusPanel title="Terminado"   items={reporteStats.terminado} color="terminado" />
      </aside>
    </div>
  );
}
