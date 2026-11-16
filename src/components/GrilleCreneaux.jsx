import { heure } from '../utils/dates';
import { formatPrix } from '../utils/format';

const ETIQUETTES = { RESERVE: 'Réservé', BLOQUE: 'Fermé', PASSE: 'Passé' };

/** Creneaux d'un jour : libres selectionnables, les autres grises avec leur raison. */
export default function GrilleCreneaux({ creneaux, choisi, onChoisir }) {
  if (!creneaux.length) {
    return <p className="rounded-md bg-surface-alt p-4 text-center text-sm text-ink-light">Le complexe est fermé ce jour-là.</p>;
  }
  const libres = creneaux.filter((c) => c.etat === 'LIBRE').length;
  return (
    <div>
      <p className="mb-3 text-sm text-ink-light">
        {libres === 0 ? 'Plus aucun créneau libre ce jour-là.' : `${libres} créneau${libres > 1 ? 'x' : ''} libre${libres > 1 ? 's' : ''}`}
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {creneaux.map((c) => {
          const libre = c.etat === 'LIBRE';
          const actif = choisi === c.debut;
          return (
            <li key={c.debut}>
              <button type="button" disabled={!libre} aria-pressed={actif} onClick={() => onChoisir(c)}
                className={`flex w-full flex-col items-center rounded-md border px-1 py-2 text-sm transition-colors ${
                  actif ? 'border-primary bg-primary text-white shadow-card'
                    : libre ? 'border-line bg-surface hover:border-primary/50'
                      : 'cursor-not-allowed border-transparent bg-surface-alt text-ink-light/60'}`}>
                <span className="font-semibold">{heure(c.debut)}</span>
                <span className={`text-[11px] ${actif ? 'text-white/85' : libre ? 'text-ink-light' : ''}`}>
                  {libre ? formatPrix(c.prix) : ETIQUETTES[c.etat]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
