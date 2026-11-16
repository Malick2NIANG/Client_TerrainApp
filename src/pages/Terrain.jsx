import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Users } from 'lucide-react';
import { getDisponibilites, getTerrain } from '../api/terrains';
import { ecouterChangements } from '../api/tempsReel';
import ChoixJour from '../components/ChoixJour';
import GrilleCreneaux from '../components/GrilleCreneaux';
import { EtatErreur, Squelette } from '../components/EtatChargement';
import { jourISO, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';

export default function Terrain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [terrain, setTerrain] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [jour, setJour] = useState(jourISO());
  const [creneaux, setCreneaux] = useState(null);
  const [choisi, setChoisi] = useState(null);

  useEffect(() => {
    getTerrain(id).then(setTerrain).catch((e) => setErreur(e.message));
  }, [id]);

  const chargerCreneaux = useCallback(() => {
    getDisponibilites(jour, id)
      .then((d) => {
        const liste = d[0]?.creneaux || [];
        setCreneaux(liste);
        // Le creneau choisi vient d'etre pris par quelqu'un d'autre : on le retire.
        setChoisi((c) => (c && liste.some((x) => x.debut === c.debut && x.etat === 'LIBRE') ? c : null));
      })
      .catch((e) => setErreur(e.message));
  }, [jour, id]);

  useEffect(() => {
    setCreneaux(null);
    setChoisi(null);
    chargerCreneaux();
    return ecouterChangements(['disponibilites', 'terrains'], chargerCreneaux);
  }, [chargerCreneaux]);

  if (erreur && !terrain) {
    return <main className="mx-auto max-w-3xl p-4"><EtatErreur titre="Ce terrain n'est pas disponible" message={erreur} onReessayer={() => window.location.reload()} /></main>;
  }

  const reserver = () => navigate('/reserver', { state: { terrain, creneau: choisi } });

  return (
    <main className="mx-auto max-w-3xl pb-24 md:pb-6">
      <div className="relative bg-primary/10 md:mt-4 md:overflow-hidden md:rounded-lg">
        {terrain?.photoUrl ? (
          <img src={terrain.photoUrl} alt="" className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
        ) : (
          <div className="aspect-[21/9] w-full bg-gradient-to-br from-primary/30 to-primary/5" />
        )}
        <Link to="/" aria-label="Retour aux terrains"
          className="absolute left-3 top-[calc(0.75rem+env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-card">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
      </div>

      <section className="px-4 pt-4 sm:px-6">
        {terrain ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{terrain.sport}</p>
            <h1 className="text-2xl font-bold">{terrain.nom}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-light">
              <span className="inline-flex items-center gap-1"><Users size={15} aria-hidden="true" /> {terrain.capacite} joueurs</span>
              <span className="inline-flex items-center gap-1"><Clock size={15} aria-hidden="true" /> Créneaux de {terrain.dureeCreneauMinutes} min</span>
              {terrain.surface && <span>{terrain.surface}</span>}
            </div>
            {terrain.description && <p className="mt-3 text-sm">{terrain.description}</p>}
            {terrain.equipements.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {terrain.equipements.map((e) => (
                  <li key={e} className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-3 py-1 text-xs">
                    <Check size={12} className="text-success" aria-hidden="true" /> {e}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="space-y-2"><Squelette className="h-4 w-24" /><Squelette className="h-7 w-48" /></div>
        )}
      </section>

      <section className="mt-6 px-4 sm:px-6">
        <h2 className="mb-3 font-bold">Choisissez un créneau</h2>
        <ChoixJour valeur={jour} onChange={setJour} />
        <div className="mt-4">
          {creneaux === null ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 9 }, (_, i) => <Squelette key={i} className="h-14 rounded-md" />)}
            </div>
          ) : (
            <GrilleCreneaux creneaux={creneaux} choisi={choisi?.debut} onChoisir={setChoisi} />
          )}
        </div>
      </section>

      {choisi && terrain && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[90] border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-6 md:mt-6 md:rounded-lg md:border">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{plage(choisi.debut, choisi.fin)}</p>
              <p className="text-sm text-primary">{formatPrix(choisi.prix)}</p>
            </div>
            <button type="button" onClick={reserver}
              className="h-12 shrink-0 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-card hover:bg-primary-dark">
              Réserver
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
