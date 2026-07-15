import { Link } from "react-router-dom";

export default function PageHeader({ title, subtitle, backTo = "/dashboard" }) {
  return (
    <header className="mb-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-200/90 hover:text-white transition mb-4"
      >
        <span aria-hidden>←</span> Back to games
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">{title}</h1>
      {subtitle && <p className="mt-2 text-indigo-100/80 max-w-2xl">{subtitle}</p>}
    </header>
  );
}
