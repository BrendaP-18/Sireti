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
        const [eqRes, evRes, rpStatsRes, reportesAllRes] = await Promise.allSettled([
          equiposService.getAll(),           // equipos totales
          calendarioService.getProximos(5),  // eventos próximos
          reportesService.getStats(),        // stats reportes_trabajador → { total, porEstado }
          reportesService.getAll(),          // todos los reportes (recientes + terminados)
        ]);

        const eqData       = eqRes.status        === 'fulfilled' ? eqRes.value.data        : [];
        const evData       = evRes.status        === 'fulfilled' ? evRes.value.data        : [];
        const rpStats      = rpStatsRes.status   === 'fulfilled' ? rpStatsRes.value.data   : { total: 0, porEstado: [] };
        const reportesAll  = reportesAllRes.status === 'fulfilled' ? reportesAllRes.value.data : [];

        // Recientes: los 5 primeros (ya vienen ordenados DESC por fecha del backend)
        const recientes    = Array.isArray(reportesAll) ? reportesAll.slice(0, 5) : [];
        // Tickets terminados
        const terminados   = Array.isArray(reportesAll)
          ? reportesAll.filter(r => (r.estado || '').toLowerCase() === 'terminado')
          : [];

        console.log('[Dashboard] reportes/stats:', rpStats);
        console.log('[Dashboard] reportes total:', reportesAll?.length, '| recientes:', recientes.length, '| terminados:', terminados.length);
        console.log('[Dashboard] calendario/proximos:', evData);

        // Total de reportes_trabajador (card Reportes)
        const totalReportes = parseInt(rpStats?.total ?? 0, 10);

        // Total de tickets terminados (card Tickets)
        const totalTickets = terminados.length;

        // Eventos próximos
        const totalEventos = Array.isArray(evData) ? evData.length : 0;

        setStats({
          equipos: Array.isArray(eqData) ? eqData.length : 0,
          soporte: totalReportes,
          tickets: totalTickets,
          eventos: totalEventos,
        });

        setTicketsRecientes(recientes);
        setEventosProximos(Array.isArray(evData) ? evData : []);

        // Panel lateral de reportes_trabajador — comparación case-insensitive
        const pe = Array.isArray(rpStats?.porEstado) ? rpStats.porEstado : [];
        setReporteStats({
          pendiente: pe
            .filter(e => (e.estado || '').toLowerCase() === 'pendiente')
            .map(e => `${e.total} reportes pendientes`),
          enProceso: pe
            .filter(e => (e.estado || '').toLowerCase() === 'en proceso')
            .map(e => `${e.total} en proceso`),
          terminado: pe
            .filter(e => (e.estado || '').toLowerCase() === 'terminado')
            .map(e => `${e.total} terminados`),
        });

        console.log('[Dashboard] Stats finales:', { equipos: eqData?.length, reportes: totalReportes, tickets: totalTickets, eventos: totalEventos });
      } catch (err) {
        console.error('[Dashboard] Error:', err);
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
          <StatCard label="Reportes" value={stats.soporte} sub="Total reportes"     icon="📋" type="reportes" />
          <StatCard label="Tickets"  value={stats.tickets} sub="Terminados"         icon="⚠️" type="tickets" />
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
                <div key={t.id_reporte_trabajador ?? t.id_reporte} className="section-item">
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
