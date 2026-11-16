import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { formatPrix } from '../utils/format';
import { Monogramme } from './Marque';

/** Tarif le plus bas du terrain (base ou plage), pour "des X / h". */
export function tarifMin(t) {
  return Math.min(t.tarifHeure, ...(t.plages || []).map((p) => p.tarifHeure));
}

export default function CarteTerrain({ terrain }) {
  return (
    <Link to={`/terrains/${terrain.id}`}
      className="group flex min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-shadow hover:shadow-float sm:flex-col">
      <div className="relative w-28 shrink-0 bg-primary/10 sm:aspect-[16/9] sm:w-full">
        {terrain.photoUrl ? (
          <img src={terrain.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-28 items-center justify-center">
            <Monogramme className="h-12 w-12 rounded-xl text-lg opacity-80" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-ink shadow-card">
          {terrain.sport}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">{terrain.nom}</h3>
          <ChevronRight size={18} className="mt-0.5 shrink-0 text-ink-light transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
        {terrain.surface && <p className="truncate text-xs text-ink-light">{terrain.surface}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-sm">
          <span className="inline-flex items-center gap-1 text-ink-light">
            <Users size={14} aria-hidden="true" /> {terrain.capacite} joueurs
          </span>
          <span className="font-semibold text-primary">dès {formatPrix(tarifMin(terrain))}/h</span>
        </div>
      </div>
    </Link>
  );
}
