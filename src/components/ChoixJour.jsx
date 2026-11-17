import { useCallback, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import CalendrierJours from './CalendrierJours';
import { jourCourtDe, prochainsJours } from '../utils/dates';

/**
 * Bandeau des 14 prochains jours, defilable, suivi de « Autre date » qui
 * ouvre le calendrier (jusqu'a 60 jours). Une date choisie plus loin
 * s'affiche en pastille active avant le bouton.
 */
export default function ChoixJour({ valeur, onChange, nb = 14 }) {
  const [calendrier, setCalendrier] = useState(false);
  const fermer = useCallback(() => setCalendrier(false), []);
  const jours = prochainsJours(nb);
  const lointain = valeur && !jours.some((j) => j.iso === valeur) ? jourCourtDe(valeur) : null;
  const pastilles = lointain ? [...jours, lointain] : jours;

  return (
    <>
      <div role="radiogroup" aria-label="Jour" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {pastilles.map((j) => {
          const actif = j.iso === valeur;
          return (
            <button key={j.iso} type="button" role="radio" aria-checked={actif} onClick={() => onChange(j.iso)}
              ref={actif && lointain ? (el) => el?.scrollIntoView({ block: 'nearest', inline: 'center' }) : undefined}
              className={`flex w-16 shrink-0 flex-col items-center rounded-md border py-2 text-xs transition-colors ${
                actif ? 'border-primary bg-primary text-white shadow-card' : 'border-line bg-surface hover:border-primary/40'}`}>
              <span className={actif ? 'text-white/85' : 'text-ink-light'}>{j.jourCourt}</span>
              <span className="text-lg font-bold leading-tight">{j.numero}</span>
              <span className={actif ? 'text-white/85' : 'text-ink-light'}>{j.mois}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => setCalendrier(true)} aria-haspopup="dialog"
          className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-primary/50 bg-primary/[0.04] py-2 text-xs font-semibold text-primary hover:bg-primary/10">
          <CalendarDays size={20} aria-hidden="true" />
          Autre date
        </button>
      </div>
      <CalendrierJours ouvert={calendrier} valeur={valeur} onChoisir={onChange} onFermer={fermer} />
    </>
  );
}
