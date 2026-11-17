import { useCallback, useEffect, useMemo, useState } from 'react';
import { positionCadrage } from '../utils/cadrage';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { getHoraires, getSports, getTendances, getTerrains } from '../api/terrains';
import { ecouterChangements } from '../api/tempsReel';
import CarteTerrain from '../components/CarteTerrain';
import BarreRecherche from '../components/BarreRecherche';
import InfosComplexe from '../components/InfosComplexe';
import BoutonNotif from '../components/BoutonNotif';
import MotifTerrain from '../components/MotifTerrain';
import { IconeSport } from '../components/Icones';
import { Monogramme, NomMarque } from '../components/Marque';
import { EtatErreur } from '../components/EtatChargement';
import { marque, sloganEnDeuxLignes } from '../config/marque';
import { estVideo, photosDe } from '../utils/recherche';
import { SqueletteAnnonces } from './NosTerrains';

// Accueil : la vitrine du complexe. Bandeau, recherche (ouvre « Nos
// terrains »), acces par sport, les terrains les plus reserves, infos
// pratiques. La liste complete est dans « Nos terrains ».
export default function Accueil() {
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [terrains, setTerrains] = useState(null);
  const [tendances, setTendances] = useState(null);
  const [horaires, setHoraires] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [q, setQ] = useState('');

  // sujet : appel venu du temps reel -> donnees fraiches (hors cache).
  const charger = useCallback((sujet) => {
    const frais = Boolean(sujet);
    setErreur(null);
    Promise.all([getSports(frais), getTerrains(frais), getTendances(4, frais)])
      .then(([s, t, top]) => {
        setSports(s);
        setTerrains(t);
        setTendances(top);
      })
      .catch((e) => setErreur(e.message));
    getHoraires(frais).then(setHoraires).catch(() => setHoraires(null));
  }, []);

  useEffect(() => {
    charger();
    return ecouterChangements(['terrains'], charger);
  }, [charger]);

  // Fond du bandeau : la premiere PHOTO d'un terrain (pas une video).
  const couverture = useMemo(() => (tendances || terrains || []).flatMap(photosDe).find((u) => !estVideo(u)), [tendances, terrains]);
  const { ligne1, ligne2 } = sloganEnDeuxLignes();
  const rechercher = (texte) => navigate(texte?.trim() ? `/terrains?q=${encodeURIComponent(texte.trim())}` : '/terrains');

  return (
    <main className="pb-6">
      <section className="relative isolate overflow-hidden bg-[rgb(var(--marque-nuit))] text-white md:mx-auto md:mt-4 md:max-w-6xl md:rounded-xl">
        {couverture && (
          <img src={couverture} alt="" aria-hidden="true" style={{ objectPosition: positionCadrage(couverture) }} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" />
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

      <div className="relative z-30 -mt-7 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <BarreRecherche valeur={q} onChange={setQ} onValider={rechercher} terrains={terrains || []} sports={sports} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {sports.length > 1 && (
          <section className="mt-8" aria-labelledby="par-sport">
            <h2 id="par-sport" className="text-lg font-bold">Envie de jouer à…</h2>
            <ul className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
              {sports.map((s) => (
                <li key={s.id} className="shrink-0">
                  <Link to={`/terrains?sport=${s.id}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface py-3 pl-3 pr-5 transition-colors hover:border-ink/30">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <IconeSport nom={s.nom} size={22} />
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold">{s.nom}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10" aria-labelledby="tendances">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 id="tendances" className="flex items-center gap-2 text-lg font-bold">
                <Flame size={20} className="text-primary" aria-hidden="true" /> Les plus réservés
              </h2>
              <p className="text-sm text-ink-light">Les terrains préférés des joueurs ce mois-ci.</p>
            </div>
            {terrains?.length > 0 && (
              <Link to="/terrains" className="hidden shrink-0 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline sm:inline-flex">
                Voir les {terrains.length} terrains <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
          {erreur ? (
            <EtatErreur titre="Les terrains n'ont pas pu être chargés" message={erreur} onReessayer={charger} />
          ) : tendances === null ? (
            <SqueletteAnnonces nb={3} />
          ) : tendances.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-light">Aucun terrain disponible pour le moment.</p>
          ) : (
            <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {tendances.map((t, i) => (
                <li key={t.id} className="min-w-0"><CarteTerrain terrain={t} badge={i === 0 ? 'N°1' : null} /></li>
              ))}
            </ul>
          )}
          {terrains?.length > 0 && (
            <Link to="/terrains"
              className="mt-8 flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/80 text-[15px] font-semibold transition-colors hover:bg-surface-alt sm:hidden">
              Voir les {terrains.length} terrains <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </section>

        <div className="mt-12">
          <InfosComplexe horaires={horaires} />
        </div>
      </div>
    </main>
  );
}
