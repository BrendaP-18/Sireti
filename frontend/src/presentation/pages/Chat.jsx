// PAC - PRESENTATION: Página de Chat
import { useState, useEffect, useRef } from 'react';
import { mensajesService } from '../../abstraction/mensajes.service';
import { useAuth } from '../../control/AuthContext';

function formatHora(f) {
  if (!f) return '';
  return new Date(f).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  const load = async () => {
    try {
      const { data } = await mensajesService.getAll(50);
      setMensajes(data);
    } catch { setMensajes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  const enviar = async () => {
    if (!texto.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await mensajesService.create({ contenido: texto.trim() });
      setMensajes(prev => [...prev, data]);
      setTexto('');
    } catch (err) { alert(err.response?.data?.error || 'Error al enviar'); }
    finally { setSending(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } };

  const esMio = (m) => m.id_usuario === usuario?.id_usuario;

  return (
    <div className="page-main" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1>Chat</h1>
        <p>Mensajería interna del equipo</p>
      </div>

      <div className="chat-container">
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Canal general</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>• {mensajes.length} mensajes</span>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div> Cargando mensajes...</div>
          ) : mensajes.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">💬</div><p className="empty-state-text">Sé el primero en escribir</p></div>
          ) : (
            mensajes.map(m => (
              <div key={m.id_mensaje} style={{ alignSelf: esMio(m) ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                {!esMio(m) && <div className="chat-meta">{m.nombre_usuario} · {formatHora(m.fecha)}</div>}
                <div className={`chat-bubble ${esMio(m) ? 'mine' : 'other'}`}>{m.contenido}</div>
                {esMio(m) && <div className="chat-meta" style={{ textAlign: 'right' }}>{formatHora(m.fecha)}</div>}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar">
          <input
            id="chat-input"
            className="chat-input"
            type="text"
            placeholder="Escribe un mensaje..."
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKey}
            disabled={sending}
          />
          <button id="chat-send" className="btn btn-primary" onClick={enviar} disabled={sending || !texto.trim()}>
            {sending ? '...' : '➤ Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
