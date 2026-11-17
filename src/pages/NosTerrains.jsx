import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { getSports, getTerrains } from '../api/terrains';
import { ecouterChangements } from '../api/tempsReel';
import CarteTerrain from '../components/CarteTerrain';
import BarreRecherche from '../components/BarreRecherche';
import BarreSports from '../components/BarreSports';
import BoutonNotif from '../components/BoutonNotif';
import { EtatErreur, Squelette } from '../components/EtatChargement';
import { filtrerTerrains } from '../utils/recherche';

export function SqueletteAnnonces({ nb = 6 }) {
  return (
    <div role="status" aria-busy="true" aria-label="Chargement des terrains"
      className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: nb }, (_, i) => (
        <div key={i}>
          <Squelette className="aspect-[4/3] rounded-xl" />
          <Squelette className="mt-3 h-4 w-2/3 rounded" />
          <Squelette className="mt-2 h-3 w-1/2 rounded" />
          <Squelette className="mt-2 h-4 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

// Tous les terrains du complexe : recherche (nom, quartier, sport,
// equipement) et filtre par sport, gardes dans l'adresse (retour depuis une
// fiche terrain = meme liste ; lien partageable).
export default function NosTerrains() {
  const [sports, setSports] = useState([]);
  const [terrains, setTerrains] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const sport = params.get('sport') ? Number(params.get('sport')) : null;
  const [colle, setColle] = useState(false);
  const repere = useRef(null);

  const majParams = (cle, valeur) => setParams((p) => {
    const n = new URLSearchParams(p);
    if (valeur === null || valeur === '') n.delete(cle); else n.set(cle, String(valeur));
    return n;
  }, { replace: true });

  // sujet : appel venu du temps reel -> donnees fraiches (hors cache).
  const charger = useCallback((sujet) => {
    const frais = Boolean(sujet);
    setErreur(null);
    Promise.all([getSports(frais), getTerrains(frais)])
      .then(([s, t]) => {
        setSports(s);
        setTerrains(t);
      })
      .catch((e) => setErreur(e.message));
  }, []);

  useEffect(() => {
    charger();
    return ecouterChangements(['terrains'], charger);
  }, [charger]);

  useEffect(() => {
    const el = repere.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(([e]) => setColle(!e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const visibles = useMemo(() => filtrerTerrains(terrains, q, sport), [terrains, q, sport]);
  const filtre = q.trim() !== '' || sport !== null;

  return (
    <main className="pb-6">
      <header className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6 md:pt-8">
        <div>
          <h1 className="titre-display text-[44px] md:text-6xl">Nos terrains</h1>
          {terrains && (
            <p className="mt-1 text-[15px] text-ink-light">
              {terrains.length} terrain{terrains.length > 1 ? 's' : ''}{sports.length > 1 ? ` · ${sports.length} sports` : ''}, à réserver en direct
            </p>
          )}
        </div>
        <BoutonNotif className="md:hidden" />
      </header>

      <div ref={repere} aria-hidden="true" className="h-4" />
      <div className={`sticky top-0 z-40 px-4 pb-3 transition-colors sm:px-6 md:top-16 ${colle ? 'bg-surface/95 pt-3 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur' : ''}`}>
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <BarreRecherche valeur={q} onChange={(v) => majParams('q', v)} terrains={terrains || []} sports={sports} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {sports.length > 1 && (
          <div className="mt-2">
            <BarreSports sports={sports} valeur={sport} onChange={(id) => majParams('sport', id)} />
          </div>
        )}

        <section className="pt-6" aria-live="polite">
          {terrains && !erreur && filtre && (
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold">
                {`${visibles.length} terrain${visibles.length > 1 ? 's' : ''}${q.trim() ? ` pour « ${q.trim()} »` : ''}`}
              </h2>
              <button type="button" onClick={() => setParams({}, { replace: true })}
                className="shrink-0 text-sm font-semibold underline underline-offset-4">
                Tout afficher
              </button>
            </div>
          )}

          {erreur ? (
            <EtatErreur titre="Les terrains n'ont pas pu être chargés" message={erreur} onReessayer={charger} />
          ) : terrains === null ? (
            <SqueletteAnnonces />
          ) : visibles.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
              <SearchX size={36} className="text-ink-light" aria-hidden="true" />
              <p className="mt-3 font-semibold">{terrains.length ? 'Aucun terrain ne correspond' : 'Aucun terrain disponible pour le moment'}</p>
              {terrains.length > 0 && <p className="mt-1 max-w-xs text-sm text-ink-light">Essayez un autre nom, un quartier ou un sport.</p>}
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((t) => <li key={t.id} className="min-w-0"><CarteTerrain terrain={t} /></li>)}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
