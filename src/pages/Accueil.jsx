import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSports, getTerrains } from '../api/terrains';
import { ecouterChangements } from '../api/tempsReel';
import CarteTerrain from '../components/CarteTerrain';
import { Monogramme, NomMarque } from '../components/Marque';
import { EtatErreur, SqueletteGrille } from '../components/EtatChargement';
import { marque, sloganEnDeuxLignes } from '../config/marque';

export default function Accueil() {
  const [sports, setSports] = useState([]);
  const [terrains, setTerrains] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [sport, setSport] = useState(null);

  const charger = useCallback(() => {
    setErreur(null);
    Promise.all([getSports(), getTerrains()])
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

  const visibles = useMemo(
    () => (terrains || []).filter((t) => sport === null || t.sportId === sport),
    [terrains, sport],
  );
  const { ligne1, ligne2 } = sloganEnDeuxLignes();

  return (
    <main className="mx-auto max-w-6xl">
      <section className="bg-[rgb(var(--marque-nuit))] px-4 pb-8 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white sm:px-6 md:rounded-b-lg md:pt-10">
        <div className="flex items-center gap-3 md:hidden">
          <Monogramme className="h-11 w-11 rounded-xl text-base" />
          <NomMarque className="text-lg font-bold tracking-tight" accentClassName="text-primary-light" />
        </div>
        <h1 className="mt-6 text-2xl font-bold leading-tight sm:text-3xl md:mt-0">
          {ligne1}
          {ligne2 && <span className="block text-primary-light">{ligne2}</span>}
        </h1>
        <p className="mt-2 text-sm text-white/75">{marque.sousTitre}</p>
      </section>

      <section className="px-4 py-6 sm:px-6">
        <h2 className="text-lg font-bold">Choisissez votre terrain</h2>
        {sports.length > 1 && (
          <div role="radiogroup" aria-label="Sport" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {[{ id: null, nom: 'Tous' }, ...sports].map((s) => (
              <button key={s.id ?? 'tous'} type="button" role="radio" aria-checked={sport === s.id} onClick={() => setSport(s.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  sport === s.id ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink hover:border-primary/40'}`}>
                {s.nom}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          {erreur ? (
            <EtatErreur titre="Les terrains n'ont pas pu être chargés" message={erreur} onReessayer={charger} />
          ) : terrains === null ? (
            <SqueletteGrille nb={4} />
          ) : visibles.length === 0 ? (
            <p className="rounded-md bg-surface-alt p-6 text-center text-sm text-ink-light">Aucun terrain disponible pour le moment.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((t) => (
                <li key={t.id} className="min-w-0"><CarteTerrain terrain={t} /></li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
