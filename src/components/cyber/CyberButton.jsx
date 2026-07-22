export default function CyberButton({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      type="button"
      className={`cyber-btn cyber-btn--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
