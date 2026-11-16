import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { getHoraires, getSports, getTerrains } from '../api/terrains';
import { ecouterChangements } from '../api/tempsReel';
import CarteTerrain from '../components/CarteTerrain';
import BarreRecherche from '../components/BarreRecherche';
import BarreSports from '../components/BarreSports';
import InfosComplexe from '../components/InfosComplexe';
import BoutonNotif from '../components/BoutonNotif';
import MotifTerrain from '../components/MotifTerrain';
import { Monogramme, NomMarque } from '../components/Marque';
import { EtatErreur, Squelette } from '../components/EtatChargement';
import { marque, sloganEnDeuxLignes } from '../config/marque';
import { estVideo, filtrerTerrains, photosDe } from '../utils/recherche';

function SqueletteAnnonces({ nb = 6 }) {
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

export default function Accueil() {
  const [sports, setSports] = useState([]);
  const [terrains, setTerrains] = useState(null);
  const [horaires, setHoraires] = useState(null);
  const [erreur, setErreur] = useState(null);
  // Recherche et sport dans l'adresse : retour depuis un terrain = meme liste.
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

  const charger = useCallback(() => {
    setErreur(null);
    Promise.all([getSports(), getTerrains()])
      .then(([s, t]) => {
        setSports(s);
        setTerrains(t);
      })
      .catch((e) => setErreur(e.message));
    getHoraires().then(setHoraires).catch(() => setHoraires(null));
  }, []);

  useEffect(() => {
    charger();
    return ecouterChangements(['terrains'], charger);
  }, [charger]);

  // Barre de recherche collee en haut : fond blanc sous la barre.
  useEffect(() => {
    const el = repere.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(([e]) => setColle(!e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const visibles = useMemo(() => filtrerTerrains(terrains, q, sport), [terrains, q, sport]);
  // Fond du bandeau : la premiere PHOTO d'un terrain (pas une video).
  const couverture = useMemo(() => (terrains || []).flatMap(photosDe).find((u) => !estVideo(u)), [terrains]);
  const { ligne1, ligne2 } = sloganEnDeuxLignes();
  const filtre = q.trim() !== '' || sport !== null;

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[rgb(var(--marque-nuit))] text-white md:mx-auto md:mt-4 md:max-w-6xl md:rounded-xl">
        {couverture && (
          <img src={couverture} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(var(--marque-nuit))] via-[rgb(var(--marque-nuit)/0.72)] to-[rgb(var(--marque-nuit)/0.35)]" />
        <MotifTerrain className="absolute -right-24 -top-10 -z-10 h-[130%] w-[520px] text-white/10 md:right-0" />
        <div className="px-5 pb-16 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-8 md:pb-20 md:pt-14">
          <div className="flex items-center gap-2.5 md:hidden">
            <Monogramme className="h-10 w-10 rounded-xl text-base" />
            <NomMarque className="titre-display flex-1 text-2xl" accentClassName="text-primary-light" />
            <BoutonNotif sombre />
          </div>
          <h1 className="titre-display mt-10 max-w-xl text-[46px] sm:text-6xl md:mt-0 md:text-7xl">
            {ligne1}
            {ligne2 && <span className="block text-primary-light">{ligne2}</span>}
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-white/80">{marque.sousTitre}</p>
          {terrains?.length > 0 && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-light" aria-hidden="true" />
              {terrains.length} terrain{terrains.length > 1 ? 's' : ''} · réservation en direct
            </p>
          )}
        </div>
      </section>

      <div ref={repere} aria-hidden="true" />
      <div className={`sticky top-0 z-40 -mt-7 px-4 pb-3 transition-colors sm:px-6 md:top-16 ${colle ? 'bg-surface/95 pt-3 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur' : ''}`}>
        <div className="mx-auto max-w-2xl">
          <BarreRecherche valeur={q} onChange={(v) => majParams('q', v)} terrains={terrains || []} sports={sports} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {sports.length > 1 && (
          <div className="mt-3">
            <BarreSports sports={sports} valeur={sport} onChange={(id) => majParams('sport', id)} />
          </div>
        )}

        <section className="pt-6" aria-live="polite">
          {terrains && !erreur && (
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold">
                {filtre
                  ? `${visibles.length} terrain${visibles.length > 1 ? 's' : ''}${q.trim() ? ` pour « ${q.trim()} »` : ''}`
                  : 'Tous les terrains'}
              </h2>
              {filtre && (
                <button type="button" onClick={() => setParams({}, { replace: true })}
                  className="shrink-0 text-sm font-semibold underline underline-offset-4">
                  Tout afficher
                </button>
              )}
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
              {terrains.length > 0 && (
                <p className="mt-1 max-w-xs text-sm text-ink-light">Essayez un autre nom, un quartier ou un sport.</p>
              )}
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((t) => (
                <li key={t.id} className="min-w-0"><CarteTerrain terrain={t} /></li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-12">
          <InfosComplexe horaires={horaires} />
        </div>
      </div>
    </main>
  );
}
