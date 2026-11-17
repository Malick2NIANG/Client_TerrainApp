import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Monogramme } from './Marque';
import MediaVignette from './MediaVignette';

// Photos d'une carte terrain, facon annonce : on fait defiler au doigt
// (defilement natif, accroche photo par photo), fleches au survol sur
// ordinateur, points en bas. Sans photo : fond de marque et monogramme.
export default function CarrouselPhotos({ photos, alt, className = '', ratio = 'aspect-[4/3]', onOuvrir, children }) {
  const piste = useRef(null);
  const [index, setIndex] = useState(0);

  if (!photos.length) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-[rgb(var(--marque-nuit)/0.12)] ${ratio} ${className}`}>
        <Monogramme className="h-14 w-14 rounded-2xl text-xl opacity-90" />
        {children}
      </div>
    );
  }

  const aller = (e, sens) => {
    // La carte est un lien : la fleche ne doit pas ouvrir le terrain.
    e.preventDefault();
    e.stopPropagation();
    const p = piste.current;
    if (p) p.scrollTo({ left: (index + sens) * p.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className={`group/photos relative overflow-hidden bg-surface-alt ${ratio} ${className}`}>
      <div ref={piste} onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {photos.map((url, i) => (onOuvrir ? (
          <button key={url} type="button" onClick={() => onOuvrir(i)} aria-label={`Agrandir le média ${i + 1}`}
            className="h-full w-full shrink-0 snap-center">
            <MediaVignette url={url} alt={i === 0 ? alt : ''} eager={i === 0} className="h-full w-full object-cover" />
          </button>
        ) : (
          <MediaVignette key={url} url={url} alt={i === 0 ? alt : ''} eager={i === 0}
            className="h-full w-full shrink-0 snap-center object-cover" />
        )))}
      </div>
      {photos.length > 1 && (
        <>
          {index > 0 && (
            <button type="button" aria-label="Photo précédente" onClick={(e) => aller(e, -1)}
              className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink opacity-0 shadow-card transition-opacity group-hover/photos:opacity-100 md:flex">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          )}
          {index < photos.length - 1 && (
            <button type="button" aria-label="Photo suivante" onClick={(e) => aller(e, 1)}
              className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink opacity-0 shadow-card transition-opacity group-hover/photos:opacity-100 md:flex">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5" aria-hidden="true">
            {photos.slice(0, 6).map((url, i) => (
              <span key={url} className={`h-1.5 rounded-full bg-white shadow transition-all ${i === Math.min(index, 5) ? 'w-4' : 'w-1.5 opacity-60'}`} />
            ))}
          </div>
        </>
      )}
      {children}
    </div>
  );
}
