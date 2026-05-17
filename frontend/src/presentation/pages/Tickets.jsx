// PAC - PRESENTATION: Página de Tickets — Solo reportes Terminados + generación de ticket PDF
import { useState, useEffect, useRef } from 'react';
import { reportesService } from '../../abstraction/reportes.service';

function formatFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatFechaCorta(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ══════════════════════════════════════
   Componente del TICKET para imprimir
══════════════════════════════════════ */
function TicketPDF({ ticket, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const contenido = printRef.current.innerHTML;
    const ventana   = window.open('', '_blank', 'width=800,height=900');
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Ticket #${ticket.id_reporte_trabajador} — SIRETI</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #f5f7fa; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 32px; }
          .ticket-wrap { background: #fff; border-radius: 20px; overflow: hidden; width: 720px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
          .ticket-header { background: linear-gradient(135deg, #1a3d2b 0%, #2d6a4f 60%, #40916c 100%); padding: 36px 40px 28px; color: #fff; position: relative; }
          .ticket-header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 30px; background: #fff; border-radius: 30px 30px 0 0; }
          .ticket-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
          .ticket-brand-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
          .ticket-brand-name { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .ticket-brand-sub { font-size: 12px; opacity: 0.65; font-weight: 400; margin-top: 1px; }
          .ticket-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
          .ticket-num { font-size: 40px; font-weight: 900; letter-spacing: -1px; }
          .ticket-num span { font-size: 18px; opacity: 0.6; font-weight: 400; }
          .ticket-body { padding: 32px 40px; }
          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #f0f0f0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
          .info-item { }
          .info-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .info-value { font-size: 14px; font-weight: 600; color: #1f2937; }
          .desc-box { background: #f8fafc; border-radius: 12px; padding: 16px 18px; border-left: 4px solid #2d6a4f; }
          .desc-box p { font-size: 14px; color: #374151; line-height: 1.7; }
          .ticket-footer { background: #f8fafc; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e5e7eb; margin-top: 28px; }
          .footer-brand { font-size: 12px; color: #9ca3af; }
          .footer-brand strong { color: #1a3d2b; }
          .seal { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #1a3d2b, #40916c); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 700; text-align: center; line-height: 1.3; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(26,61,43,0.3); }
          .chip-terminado { display: inline-block; background: #d1fae5; color: #065f46; border-radius: 100px; padding: 3px 12px; font-size: 12px; font-weight: 700; }
          .chip-baja    { background: #d1fae5; color: #065f46; }
          .chip-media   { background: #fef3c7; color: #d97706; }
          .chip-alta    { background: #fee2e2; color: #dc2626; }
          .divider { border: none; border-top: 1px dashed #e5e7eb; margin: 20px 0; }
          @media print { body { background: #fff; padding: 0; } .ticket-wrap { box-shadow: none; border-radius: 0; width: 100%; } }
        </style>
      </head>
      <body>
        ${contenido}
        <script>window.onload = () => { window.print(); }<\/script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  const prioChip = { Baja: 'chip-baja', Media: 'chip-media', Alta: 'chip-alta' }[ticket.prioridad || 'Baja'];

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

        {/* Acciones del modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Vista previa del ticket</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ borderRadius: 100, padding: '7px 20px', fontSize: 13 }} onClick={handlePrint}>
              🖨️ Imprimir / Guardar PDF
            </button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Contenido del ticket */}
        <div ref={printRef}>
          <div className="ticket-wrap" style={{ background: '#fff', borderRadius: 0, boxShadow: 'none' }}>

            {/* ── Header verde ── */}
            <div style={{
              background: 'linear-gradient(135deg, #1a3d2b 0%, #2d6a4f 60%, #40916c 100%)',
              padding: '36px 40px 52px', color: '#fff', position: 'relative',
            }}>
              {/* Curva inferior */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: '#fff', borderRadius: '30px 30px 0 0' }}></div>

              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>SIRETI</div>
                  <div style={{ fontSize: 11, opacity: 0.65, fontWeight: 400 }}>Sistema de Soporte e Inventario TI</div>
                </div>
              </div>

              {/* Badge Completado */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                ✅ Ticket completado
              </div>

              {/* Número */}
              <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
                <span style={{ fontSize: 18, opacity: 0.6, fontWeight: 400 }}># </span>
                {String(ticket.id_reporte_trabajador).padStart(5, '0')}
              </div>
            </div>

            {/* ── Cuerpo ── */}
            <div style={{ padding: '28px 40px' }}>

              {/* Info principal */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
                Información del reporte
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  ['Trabajador',  ticket.nombre_usuario || '—'],
                  ['Equipo',      ticket.nombre_equipo  || '—'],
                  ['Estado',      ticket.estado],
                  ['Prioridad',   ticket.prioridad || 'Baja'],
                  ['Fecha de reporte',   formatFechaCorta(ticket.fecha)],
                  ['Fecha de cierre',    formatFechaCorta(new Date())],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Descripción */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
                Descripción del problema
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px', borderLeft: '4px solid #2d6a4f', marginBottom: 28 }}>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{ticket.descripcion || '—'}</p>
              </div>

              {/* Resolución */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>
                Estado de resolución
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#065f46' }}>Problema resuelto</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Este ticket ha sido marcado como Terminado</div>
                </div>
              </div>

              {/* Línea punteada separadora */}
              <div style={{ border: 'none', borderTop: '1px dashed #e5e7eb', margin: '4px 0 24px' }}></div>

              {/* Footer del ticket */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  <div style={{ fontWeight: 600, color: '#1a3d2b', fontSize: 13 }}>SIRETI</div>
                  <div>Sistema de Soporte e Inventario TI</div>
                  <div style={{ marginTop: 4 }}>Generado el {formatFechaCorta(new Date())}</div>
                </div>

                {/* Sello */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a3d2b, #40916c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(26,61,43,0.25)',
                  flexShrink: 0,
                }}>
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, lineHeight: 1.3 }}>TICKET</div>
                    <div style={{ fontSize: 8, fontWeight: 700, lineHeight: 1.3 }}>CERRADO</div>
                    <div style={{ fontSize: 14, fontWeight: 900 }}>✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════ */
export default function Tickets() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      // Solo traer los reportes con estado Terminado
      const res = await reportesService.getAll('Terminado');
      setTickets(res.data || []);
    } catch { setTickets([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtrados = tickets.filter(t =>
    search.trim() === '' ||
    t.nombre_usuario?.toLowerCase().includes(search.toLowerCase()) ||
    t.nombre_equipo?.toLowerCase().includes(search.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-main">

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Tickets Completados</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Reportes con estado <strong style={{ color: '#059669' }}>Terminado</strong> — genera e imprime el ticket oficial
        </p>
      </div>

      {/* ── Stat ── */}
      <div style={{
        background: 'var(--sidebar-bg)', borderRadius: 16, padding: '18px 24px',
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        boxShadow: '0 4px 20px rgba(26,61,43,0.2)',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          🎫
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>Total de tickets completados</div>
          <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{tickets.length}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: '#a8d5ba', fontWeight: 600 }}>
            ✅ Todos resueltos
          </div>
        </div>
      </div>

      {/* ── Buscador ── */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 380 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar por trabajador, equipo o problema..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1px solid var(--border-color)', borderRadius: 100, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fff' }} />
      </div>

      {/* ── Lista de tickets ── */}
      {loading ? (
        <div className="loading-center"><div className="spinner"></div> Cargando tickets...</div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div style={{ fontSize: 52 }}>🎫</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-secondary)', marginTop: 12 }}>No hay tickets completados</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Los tickets aparecerán aquí cuando un reporte sea marcado como <strong>Terminado</strong></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtrados.map(t => (
            <div key={t.id_reporte_trabajador} style={{
              background: '#fff', border: '1px solid var(--border-color)',
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Ícono */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>✅</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#9ca3af', fontSize: 12 }}>
                    #{String(t.id_reporte_trabajador).padStart(5, '0')}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    {t.nombre_usuario || '—'}
                  </span>
                  {t.nombre_equipo && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: 6 }}>
                      🖥️ {t.nombre_equipo}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                  {t.descripcion}
                </p>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  🕐 {formatFecha(t.fecha)}
                </div>
              </div>

              {/* Badge terminado */}
              <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                Terminado
              </div>

              {/* Botón generar ticket */}
              <button
                id={`btn-ticket-${t.id_reporte_trabajador}`}
                className="btn btn-primary"
                style={{ borderRadius: 100, padding: '8px 18px', fontSize: 13, flexShrink: 0, whiteSpace: 'nowrap' }}
                onClick={() => setSelected(t)}
              >
                🎫 Generar ticket
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Ticket PDF ── */}
      {selected && <TicketPDF ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
