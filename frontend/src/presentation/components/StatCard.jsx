// PAC - PRESENTATION: Componente StatCard
export default function StatCard({ label, value, sub, icon, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-value">{value ?? 0}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}
