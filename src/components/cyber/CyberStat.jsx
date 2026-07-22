export default function CyberStat({ label, value, highlight = false, delay = 0 }) {
  return (
    <div
      className={`cyber-stat${highlight ? " cyber-stat--highlight" : ""}`}
      style={{ "--stat-delay": `${delay}ms` }}
    >
      <span className="cyber-stat-value">{value}</span>
      <span className="cyber-stat-label">{label}</span>
    </div>
  );
}

export function CyberStatGrid({ children }) {
  return <div className="cyber-stat-grid">{children}</div>;
}
