import { useState } from 'react';
import { Star } from 'lucide-react';
import { LIBELLES_NOTE } from '../utils/avis';

/** Note en etoiles (lecture). */
export function Etoiles({ note, taille = 14, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={taille} aria-hidden="true"
          className={i <= Math.round(note) ? 'fill-amber-400 text-amber-400' : 'fill-line text-line'} />
      ))}
    </span>
  );
}

/** Choix d'une note de 1 a 5 (gros boutons, au doigt). */
export function ChoixEtoiles({ valeur, onChange }) {
  const [survol, setSurvol] = useState(0);
  const affichee = survol || valeur;
  return (
    <div>
      <div role="radiogroup" aria-label="Note sur 5" className="flex gap-1" onMouseLeave={() => setSurvol(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={valeur === i} aria-label={`${i} sur 5 : ${LIBELLES_NOTE[i]}`}
            onClick={() => onChange(i)} onMouseEnter={() => setSurvol(i)}
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform active:scale-90">
            <Star size={30} aria-hidden="true"
              className={i <= affichee ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-ink-light/50'} />
          </button>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm font-semibold text-ink-light">{affichee ? LIBELLES_NOTE[affichee] : ''}</p>
    </div>
  );
}
