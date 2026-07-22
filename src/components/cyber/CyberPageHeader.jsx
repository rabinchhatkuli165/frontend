import { Link } from "react-router-dom";

export default function CyberPageHeader({ title, subtitle, tag, backTo = "/dashboard" }) {
  return (
    <header className="cyber-page-header">
      <Link to={backTo} className="cyber-back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        RETURN TO HUB
      </Link>

      {tag && (
        <div className="cyber-page-tag">
          <span className="cyber-page-tag-dot" />
          {tag}
        </div>
      )}

      <h1 className="cyber-page-title">{title}</h1>
      {subtitle && <p className="cyber-page-subtitle">{subtitle}</p>}
    </header>
  );
}
