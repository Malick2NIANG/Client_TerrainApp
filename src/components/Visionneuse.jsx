import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { estVideo } from '../utils/recherche';

// Photos et videos en plein ecran, sur fond noir : on fait glisser au doigt
// (ou fleches / clavier), la video en cours se lit avec ses commandes, les
// autres sont mises en pause.
export default function Visionneuse({ medias, depart = 0, titre, onFermer }) {
  const piste = useRef(null);
  const videos = useRef([]);
  const [index, setIndex] = useState(depart);
  useScrollLock(true);

  useLayoutEffect(() => {
    const p = piste.current;
    if (p) p.scrollLeft = depart * p.clientWidth;
  }, [depart]);

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) v.play().catch(() => {});
      else v.pause();
    });
  }, [index]);

  const aller = useCallback((sens) => {
    const p = piste.current;
    if (p) p.scrollTo({ left: (index + sens) * p.clientWidth, behavior: 'smooth' });
  }, [index]);

  useEffect(() => {
    const touche = (e) => {
      if (e.key === 'Escape') onFermer();
      if (e.key === 'ArrowRight') aller(1);
      if (e.key === 'ArrowLeft') aller(-1);
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [aller, onFermer]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`${titre} : photos et vidéos`}
      className="fixed inset-0 z-[400] flex flex-col bg-black text-white [animation:fadeUp_.2s_ease-out]">
      <div className="flex h-14 shrink-0 items-center justify-between px-3 pt-[env(safe-area-inset-top)] sm:px-5">
        <button type="button" onClick={onFermer} aria-label="Fermer" autoFocus
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
          <X size={22} aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold tabular-nums">{index + 1} / {medias.length}</p>
        <span className="w-10" aria-hidden="true" />
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={piste} onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
          className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {medias.map((url, i) => (
            <div key={url} className="flex h-full w-full shrink-0 snap-center items-center justify-center p-2 sm:p-8">
              {estVideo(url) ? (
                <video ref={(el) => { videos.current[i] = el; }} src={url} controls playsInline preload="metadata"
                  className="max-h-full max-w-full rounded-md" />
              ) : (
                <img src={url} alt={`${titre}, photo ${i + 1}`} loading={Math.abs(i - depart) < 2 ? 'eager' : 'lazy'}
                  className="max-h-full max-w-full select-none object-contain" draggable="false" />
              )}
            </div>
          ))}
        </div>
        {index > 0 && (
          <button type="button" onClick={() => aller(-1)} aria-label="Précédent"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white md:flex">
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        )}
        {index < medias.length - 1 && (
          <button type="button" onClick={() => aller(1)} aria-label="Suivant"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white md:flex">
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="h-[max(1rem,env(safe-area-inset-bottom))] shrink-0" />
    </div>
  );
}
