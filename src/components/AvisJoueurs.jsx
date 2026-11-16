import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getAvisTerrain } from '../api/avis';
import { Etoiles } from './Etoiles';
import { noteLisible } from '../utils/avis';

const MOIS = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', month: 'long', year: 'numeric' });
const PAR_PAGE = 4;

// Avis des joueurs sur la fiche terrain (facon annonce) : note moyenne,
// puis les avis les plus recents, prenom + initiale seulement.
export default function AvisJoueurs({ terrain }) {
  const [avis, setAvis] = useState(null);
  const [nb, setNb] = useState(PAR_PAGE);

  useEffect(() => {
    getAvisTerrain(terrain.id).then(setAvis).catch(() => setAvis([]));
  }, [terrain.id, terrain.nombreAvis]);

  if (!terrain.nombreAvis || !avis?.length) return null;
  return (
    <section className="border-t border-line py-7" aria-labelledby="avis">
      <h2 id="avis" className="flex items-center gap-2 text-xl font-bold">
        <Star size={20} className="fill-ink text-ink" aria-hidden="true" />
        {noteLisible(terrain.noteMoyenne)} · {terrain.nombreAvis} avis
      </h2>
      <ul className="mt-5 grid gap-6 sm:grid-cols-2">
        {avis.slice(0, nb).map((a) => (
          <li key={a.id}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--marque-nuit))] text-sm font-bold text-white">
                {a.auteur.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <span className="block font-semibold">{a.auteur}</span>
                <span className="block text-xs capitalize text-ink-light">{MOIS.format(new Date(a.creeLe))}</span>
              </span>
            </div>
            <Etoiles note={a.note} taille={13} className="mt-2" />
            {a.commentaire && <p className="mt-1 text-[15px] leading-relaxed">{a.commentaire}</p>}
          </li>
        ))}
      </ul>
      {avis.length > nb && (
        <button type="button" onClick={() => setNb((n) => n + PAR_PAGE)}
          className="mt-6 h-11 rounded-xl border border-ink/80 px-5 text-sm font-semibold hover:bg-surface-alt">
          Voir plus d’avis
        </button>
      )}
    </section>
  );
}
