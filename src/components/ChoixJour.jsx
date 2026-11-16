import { prochainsJours } from '../utils/dates';

/** Bandeau des 14 prochains jours, defilable. */
export default function ChoixJour({ valeur, onChange, nb = 14 }) {
  const jours = prochainsJours(nb);
  return (
    <div role="radiogroup" aria-label="Jour" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {jours.map((j) => {
        const actif = j.iso === valeur;
        return (
          <button key={j.iso} type="button" role="radio" aria-checked={actif} onClick={() => onChange(j.iso)}
            className={`flex w-16 shrink-0 flex-col items-center rounded-md border py-2 text-xs transition-colors ${
              actif ? 'border-primary bg-primary text-white shadow-card' : 'border-line bg-surface hover:border-primary/40'}`}>
            <span className={actif ? 'text-white/85' : 'text-ink-light'}>{j.jourCourt}</span>
            <span className="text-lg font-bold leading-tight">{j.numero}</span>
            <span className={actif ? 'text-white/85' : 'text-ink-light'}>{j.mois}</span>
          </button>
        );
      })}
    </div>
  );
}
