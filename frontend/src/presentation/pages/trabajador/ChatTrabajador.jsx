// PAC - PRESENTATION: Chat del Trabajador (con admin y técnico TI)
import { useState, useEffect, useRef } from 'react';
import { mensajesService } from '../../../abstraction/mensajes.service';
import { useAuth }          from '../../../control/AuthContext';

function formatHora(f) {
  if (!f) return '';
  return new Date(f).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function formatFechaGrupo(f) {
  if (!f) return '';
  return new Date(f).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getInitials(nombre) {
  if (!nombre) return '??';
  return nombre.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
}

const AVATAR_COLORS = ['#2d6a4f','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
function avatarColor(id) { return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]; }

export default function ChatTrabajador() {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  const load = async () => {
    try {
      const { data } = await mensajesService.getAll(100);
      setMensajes(data);
    } catch { setMensajes([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  const enviar = async () => {
    if (!texto.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await mensajesService.create({ contenido: texto.trim() });
      setMensajes(prev => [...prev, data]);
      setTexto('');
    } catch { alert('Error al enviar mensaje'); }
    finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } };
  const esMio = (m) => m.id_usuario === usuario?.id_usuario;

  // Agrupar por día
  const grupos = mensajes.reduce((acc, m) => {
    const day = formatFechaGrupo(m.fecha);
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  return (
    <div className="page-main" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: '20px 24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Chat</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Comunícate con el administrador y el técnico TI</p>
      </div>

      {/* Tarjeta de canal */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 16,
        border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 20,
      }}>
        {/* Encabezado canal */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sidebar-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
              💬
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Canal de soporte</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administradores y técnicos TI activos</div>
          </div>
          <button className="btn btn-secondary" style={{ marginLeft: 'auto', borderRadius: 100, fontSize: 12 }} onClick={load}>
            🔄 Actualizar
          </button>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loading ? (
            <div className="loading-center"><div className="spinner"></div> Cargando mensajes...</div>
          ) : mensajes.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>💬</div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8 }}>No hay mensajes aún</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Escribe al administrador o técnico TI</p>
            </div>
          ) : (
            Object.entries(grupos).map(([dia, msgs]) => (
              <div key={dia}>
                {/* Separador de fecha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 8px' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }}></div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', padding: '2px 10px', background: 'var(--bg-main)', borderRadius: 100 }}>
                    {dia}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }}></div>
                </div>

                {msgs.map(m => (
                  <div key={m.id_mensaje} style={{
                    display: 'flex', gap: 8, marginBottom: 10,
                    flexDirection: esMio(m) ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                  }}>
                    {/* Avatar */}
                    {!esMio(m) && (
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: avatarColor(m.id_usuario),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 11, fontWeight: 700,
                      }}>
                        {getInitials(m.nombre_usuario)}
                      </div>
                    )}

                    <div style={{ maxWidth: '65%' }}>
                      {/* Nombre y hora */}
                      {!esMio(m) && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, paddingLeft: 4 }}>
                          {m.nombre_usuario} · {formatHora(m.fecha)}
                        </div>
                      )}
                      {esMio(m) && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textAlign: 'right', paddingRight: 4 }}>
                          {formatHora(m.fecha)}
                        </div>
                      )}

                      {/* Burbuja */}
                      <div style={{
                        padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                        background: esMio(m) ? 'var(--sidebar-active)' : 'var(--bg-main)',
                        color: esMio(m) ? '#fff' : 'var(--text-primary)',
                        borderBottomRightRadius: esMio(m) ? 4 : 14,
                        borderBottomLeftRadius: esMio(m) ? 14 : 4,
                      }}>
                        {m.contenido}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
          <input
            id="chat-trabajador-input"
            type="text"
            placeholder="Escribe un mensaje al administrador o técnico..."
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKey}
            disabled={sending}
            style={{
              flex: 1, padding: '10px 16px',
              border: '1px solid var(--border-color)', borderRadius: 100,
              fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--sidebar-active)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button
            id="chat-trabajador-send"
            className="btn btn-primary"
            style={{ borderRadius: 100, padding: '10px 20px' }}
            onClick={enviar}
            disabled={sending || !texto.trim()}
          >
            {sending ? '...' : '➤ Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
