import { Grid2x2 } from 'lucide-react';
import { Monogramme } from './Marque';
import MediaVignette from './MediaVignette';
import { libelleMedias } from '../utils/recherche';

function Photo({ url, i, titre, onOuvrir, className = '' }) {
  return (
    <button type="button" onClick={() => onOuvrir(i)} className={`group relative overflow-hidden ${className}`}
      aria-label={`Agrandir le média ${i + 1} de ${titre}`}>
      <MediaVignette url={url} className="h-full w-full object-cover transition-[filter] duration-300 group-hover:brightness-90" eager />
    </button>
  );
}

// Ordinateur / tablette : une grande photo et jusqu'a quatre petites, coins
// arrondis sur l'ensemble (facon annonce). Chaque photo ouvre la galerie.
export default function MosaiquePhotos({ photos, titre, onOuvrir, onToutVoir }) {
  if (!photos.length) {
    return (
      <div className="flex aspect-[8/3] items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-[rgb(var(--marque-nuit)/0.12)]">
        <Monogramme className="h-16 w-16 rounded-2xl text-2xl" />
      </div>
    );
  }
  const petites = photos.slice(1, 5);
  const colonnes = petites.length >= 3 ? 'grid-cols-4' : petites.length ? 'grid-cols-3' : 'grid-cols-1';
  return (
    <div className="relative">
      {/* Ratios choisis pour que chaque case reste en 4:3, le cadre du recadrage
          fait par le gérant : 8/3 (1 grande + 4 petites), 2/1 (1 + 1-2), 4:3 seule. */}
      <div className={`grid gap-2 overflow-hidden rounded-xl ${colonnes} ${petites.length >= 3 ? 'aspect-[8/3] grid-rows-2' : petites.length ? 'aspect-[2/1]' : 'mx-auto aspect-[4/3] max-w-2xl'}`}>
        <Photo url={photos[0]} i={0} titre={titre} onOuvrir={onOuvrir}
          className={petites.length >= 3 ? 'col-span-2 row-span-2' : petites.length ? 'col-span-2' : ''} />
        {petites.length >= 3
          ? petites.map((url, k) => (
            <Photo key={url} url={url} i={k + 1} titre={titre} onOuvrir={onOuvrir} className={petites.length === 3 && k === 2 ? 'col-span-2' : ''} />
          ))
          : petites.length > 0 && (
            <div className="grid gap-2" style={{ gridTemplateRows: `repeat(${petites.length}, minmax(0, 1fr))` }}>
              {petites.map((url, k) => <Photo key={url} url={url} i={k + 1} titre={titre} onOuvrir={onOuvrir} />)}
            </div>
          )}
      </div>
      {photos.length > 1 && (
        <button type="button" onClick={onToutVoir}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-ink/80 bg-surface px-3.5 py-2 text-sm font-semibold shadow-card hover:bg-surface-alt">
          <Grid2x2 size={16} aria-hidden="true" /> Afficher les {libelleMedias(photos)}
        </button>
      )}
    </div>
  );
}
