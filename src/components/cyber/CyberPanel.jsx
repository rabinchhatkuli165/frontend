export default function CyberPanel({ children, className = "" }) {
  return (
    <div className={`cyber-panel ${className}`.trim()}>
      <span className="cyber-panel-corner cyber-panel-corner--tl" aria-hidden />
      <span className="cyber-panel-corner cyber-panel-corner--tr" aria-hidden />
      <span className="cyber-panel-corner cyber-panel-corner--bl" aria-hidden />
      <span className="cyber-panel-corner cyber-panel-corner--br" aria-hidden />
      <div className="cyber-panel-inner">{children}</div>
    </div>
  );
}
