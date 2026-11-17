import { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import MediaVignette from './MediaVignette';
import { libelleMedias } from '../utils/recherche';

// Toutes les photos de l'annonce, en plein ecran : la premiere en grand,
// les suivantes deux par deux. Ouverte sur la photo touchee.
export default function GaleriePlein({ photos, titre, depart = 0, onFermer, onOuvrir, actif = true }) {
  const refs = useRef([]);
  useScrollLock(true);

  useEffect(() => {
    refs.current[depart]?.scrollIntoView({ block: 'start' });
    const echap = (e) => actif && e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [depart, onFermer, actif]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Photos de ${titre}`}
      className="fixed inset-0 z-[300] overflow-y-auto bg-surface [animation:fadeUp_.25s_ease-out]">
      <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur sm:px-6">
        <button type="button" onClick={onFermer} aria-label="Fermer les photos" autoFocus
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-alt">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <p className="min-w-0 truncate text-sm font-semibold">{titre} · {libelleMedias(photos)}</p>
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 p-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:gap-3 sm:p-6">
        {photos.map((url, i) => (
          <button key={url} type="button" ref={(el) => { refs.current[i] = el; }} onClick={() => onOuvrir(i)}
            aria-label={`Agrandir le média ${i + 1}`}
            className={`scroll-mt-16 overflow-hidden rounded-md ${i % 3 === 0 ? 'col-span-2 aspect-[3/2]' : 'aspect-square'}`}>
            <MediaVignette url={url} alt={`${titre}, média ${i + 1}`} eager={Math.abs(i - depart) < 3}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
          </button>
        ))}
      </div>
    </div>
  );
}
