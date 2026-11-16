import { Link } from 'react-router-dom';
import { Flame, MapPin, Users } from 'lucide-react';
import { formatPrix } from '../utils/format';
import { photosDe, tarifMin } from '../utils/recherche';
import CarrouselPhotos from './CarrouselPhotos';
import { IconeSport } from './Icones';

export { tarifMin };

// Carte "annonce" : grande photo (galerie au doigt), puis en quelques lignes
// ce qui decide le client : ou, combien de joueurs, a partir de combien.
export default function CarteTerrain({ terrain, badge }) {
  const t = terrain;
  const min = tarifMin(t);
  return (
    <Link to={`/terrains/${t.id}`} className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
      <CarrouselPhotos photos={photosDe(t)} alt={t.nom} className="rounded-xl">
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-card backdrop-blur">
          <IconeSport nom={t.sport} size={14} className="text-primary" /> {t.sport}
        </span>
        {badge && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[rgb(var(--marque-nuit))] px-2.5 py-1 text-xs font-semibold text-white shadow-card">
            <Flame size={13} className="text-primary-light" aria-hidden="true" /> {badge}
          </span>
        )}
      </CarrouselPhotos>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-bold">{t.nom}</h3>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-light">
          <Users size={14} aria-hidden="true" /> {t.capacite}
        </span>
      </div>
      {t.localite && (
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-light">
          <MapPin size={14} className="shrink-0" aria-hidden="true" /> <span className="truncate">{t.localite}</span>
        </p>
      )}
      <p className="truncate text-sm text-ink-light">
        {[t.surface, `créneaux de ${t.dureeCreneauMinutes} min`].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-1.5 text-[15px]">
        {min < t.tarifHeure && <span className="text-ink-light">dès </span>}
        <span className="font-bold">{formatPrix(min)}</span>
        <span className="text-ink-light"> / heure</span>
      </p>
    </Link>
  );
}
