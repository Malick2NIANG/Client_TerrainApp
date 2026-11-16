import { statut } from '../utils/statuts';

export default function BadgeStatut({ code }) {
  const s = statut(code);
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.classe}`}>{s.libelle}</span>;
}
