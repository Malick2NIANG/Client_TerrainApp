import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { JOURS_RESERVABLES, ajouterJours, grilleMois, jourISO, libelleMois } from '../utils/dates';

const ENTETES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Choisir n'importe quel jour reservable (aujourd'hui -> +60 jours) :
// feuille du bas sur smartphone, fenetre centree sur ordinateur.
export default function CalendrierJours({ ouvert, valeur, onChoisir, onFermer }) {
  const aujourdhui = jourISO();
  const limite = ajouterJours(aujourdhui, JOURS_RESERVABLES);
  const depart = valeur || aujourdhui;
  const [mois, setMois] = useState({ annee: +depart.slice(0, 4), mois: +depart.slice(5, 7) - 1 });
  const [visible, setVisible] = useState(false);
  useScrollLock(ouvert);

  useEffect(() => {
    if (!ouvert) {
      setVisible(false);
      return undefined;
    }
    setMois({ annee: +depart.slice(0, 4), mois: +depart.slice(5, 7) - 1 });
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [ouvert, onFermer, depart]);

  if (!ouvert) return null;

  const cle = (a, m) => a * 12 + m;
  const min = cle(+aujourdhui.slice(0, 4), +aujourdhui.slice(5, 7) - 1);
  const max = cle(+limite.slice(0, 4), +limite.slice(5, 7) - 1);
  const actuel = cle(mois.annee, mois.mois);
  const decaler = (n) => {
    const c = actuel + n;
    setMois({ annee: Math.floor(c / 12), mois: c % 12 });
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titre-calendrier"
      className={`fixed inset-0 z-[260] flex items-end justify-center bg-black/60 transition-opacity duration-200 md:items-center md:p-6 ${
        visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onFermer}>
      <div onClick={(e) => e.stopPropagation()}
        className={`w-full overflow-hidden rounded-t-3xl bg-surface pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float transition-transform duration-300 ease-out md:max-w-sm md:rounded-3xl md:pb-5 ${
          visible ? 'translate-y-0' : 'translate-y-full md:translate-y-4'}`}>
        <div className="flex justify-center pb-1 pt-3 md:hidden" aria-hidden="true">
          <div className="h-1.5 w-12 rounded-full bg-ink/15" />
        </div>
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-2 md:pt-5">
          <div>
            <h2 id="titre-calendrier" className="text-lg font-semibold">Choisir une date</h2>
            <p className="mt-0.5 text-xs text-ink-light">Réservable jusqu’à {JOURS_RESERVABLES} jours à l’avance.</p>
          </div>
          <button type="button" onClick={onFermer} aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt">
            <X size={18} />
          </button>
        </div>

        <div className="px-5">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => decaler(-1)} disabled={actuel <= min} aria-label="Mois précédent"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-alt disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <p className="font-semibold capitalize" aria-live="polite">{libelleMois(mois.annee, mois.mois)}</p>
            <button type="button" onClick={() => decaler(1)} disabled={actuel >= max} aria-label="Mois suivant"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-alt disabled:opacity-30">
              <ChevronRight size={20} />
            </button>
          </div>
          <table className="mt-2 w-full table-fixed text-center text-sm">
            <thead>
              <tr>{ENTETES.map((j, i) => <th key={i} scope="col" className="pb-1 text-xs font-medium text-ink-light">{j}</th>)}</tr>
            </thead>
            <tbody>
              {grilleMois(mois.annee, mois.mois).map((semaine, i) => (
                <tr key={i}>
                  {semaine.map((iso, k) => {
                    if (!iso) return <td key={k} />;
                    const horsPeriode = iso < aujourdhui || iso > limite;
                    const choisi = iso === valeur;
                    return (
                      <td key={k} className="p-0.5">
                        <button type="button" disabled={horsPeriode} aria-pressed={choisi}
                          aria-label={iso}
                          onClick={() => { onChoisir(iso); onFermer(); }}
                          className={`flex h-10 w-full items-center justify-center rounded-full font-semibold transition-colors ${
                            choisi ? 'bg-primary text-white'
                              : horsPeriode ? 'text-ink-light/40'
                                : iso === aujourdhui ? 'text-primary ring-1 ring-primary/40 hover:bg-primary/10'
                                  : 'hover:bg-primary/10'}`}>
                          {+iso.slice(8)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
