// PAC - PRESENTATION: Panel lateral de estados
export default function StatusPanel({ title, items, emptyText = 'Sin reportes', color }) {
  const colorMap = {
    pendiente: '#fef3c7',
    'en-proceso': '#dbeafe',
    terminado: '#d1fae5',
  };

  return (
    <div className="status-panel-card" style={{ background: colorMap[color] || '#fff' }}>
      <div className="status-panel-header">
        <span className="status-panel-title">{title}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      {(!items || items.length === 0) ? (
        <p className="status-panel-empty">{emptyText}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.slice(0, 3).map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: '#374151', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
