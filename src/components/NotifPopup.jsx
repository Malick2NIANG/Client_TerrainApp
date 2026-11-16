import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Megaphone, Volume2, VolumeX, X } from 'lucide-react';
import { useNotif } from '../context/NotifContext';
import useScrollLock from '../hooks/useScrollLock';

// Annonces du gerant : toutes les chaines publiees a la suite (la derniere
// d'abord). Carrousel AUTOMATIQUE et MANIPULABLE en meme temps : il avance
// tout seul (photo : 5 s ; video : jusqu'a sa fin), et le client peut
// balayer du doigt, utiliser les fleches, le clavier ou les points ; toute
// action met le defilement automatique en pause quelques secondes.
// Video : lecture automatique sans le son (regle des navigateurs), bouton
// pour activer le son. Telephone : feuille du bas ; ordinateur : fenetre,
// visuel a gauche.
const DUREE = 5000;
const PAUSE_APRES_ACTION = 8000;

export default function NotifPopup() {
  const { ouvert, fermer, chaines } = useNotif();
  const [index, setIndex] = useState(0);
  const [pauseJusqua, setPauseJusqua] = useState(0);
  const [survol, setSurvol] = useState(false);
  const [son, setSon] = useState(false);
  const toucher = useRef(null);
  const barre = useRef(null);
  useScrollLock(ouvert);

  const sequence = useMemo(
    () => chaines.flatMap((chaine, numChaine) =>
      chaine.slides.map((slide, numSlide) => ({ chaine, slide, numChaine, numSlide }))),
    [chaines],
  );
  const total = sequence.length;
  const pos = total ? ((index % total) + total) % total : 0;
  const courant = total ? sequence[pos] : null;
  const video = courant?.slide.mediaType === 'VIDEO' && Boolean(courant.slide.mediaUrl);

  const aller = useCallback((delta) => {
    setIndex((i) => i + delta);
    setPauseJusqua(Date.now() + PAUSE_APRES_ACTION);
  }, []);

  useEffect(() => {
    if (ouvert) setIndex(0);
  }, [ouvert]);

  // Photo : passe a la suivante apres DUREE (sauf survol, pause apres action).
  // Video : c'est la fin de la video qui fait avancer (onEnded).
  useEffect(() => {
    if (!ouvert || total < 2 || survol || video) return undefined;
    const attente = Math.max(DUREE, pauseJusqua - Date.now());
    const t = setTimeout(() => setIndex((i) => i + 1), attente);
    return () => clearTimeout(t);
  }, [ouvert, total, survol, pauseJusqua, index, video]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') aller(1);
      if (e.key === 'ArrowLeft') aller(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ouvert, fermer, aller]);

  if (!ouvert) return null;

  const debutToucher = (e) => {
    toucher.current = e.touches[0].clientX;
  };
  const finToucher = (e) => {
    if (toucher.current === null) return;
    const dx = e.changedTouches[0].clientX - toucher.current;
    toucher.current = null;
    if (Math.abs(dx) > 40) aller(dx < 0 ? 1 : -1);
  };

  // Progression de la video dans sa barre (sans re-rendu a chaque image).
  const avancementVideo = (e) => {
    const v = e.currentTarget;
    if (barre.current && v.duration) barre.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
  };
  const finVideo = () => {
    if (total > 1) setIndex((i) => i + 1);
  };

  const slidesChaine = courant ? courant.chaine.slides.length : 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/65 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={fermer} role="dialog" aria-modal="true" aria-label="Annonces">
      <div className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-xl bg-surface shadow-float [animation:fadeUp_.3s_ease-out] sm:max-h-[min(78dvh,520px)] sm:max-w-3xl sm:flex-row sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setSurvol(true)} onMouseLeave={() => setSurvol(false)}
        onTouchStart={debutToucher} onTouchEnd={finToucher}>
        <button type="button" onClick={fermer} aria-label="Fermer"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm active:scale-95 sm:bg-surface-alt sm:text-ink">
          <X size={20} aria-hidden="true" />
        </button>

        {courant ? (
          <>
            <div className="relative aspect-[4/3] max-h-[44dvh] w-full shrink-0 overflow-hidden bg-[rgb(var(--marque-nuit))] sm:aspect-auto sm:max-h-none sm:w-[52%]">
              {courant.slide.mediaUrl ? (
                video ? (
                  <video key={`${pos}-${courant.slide.mediaUrl}`} src={courant.slide.mediaUrl}
                    className="h-full w-full object-cover" autoPlay muted={!son} playsInline preload="auto"
                    loop={total < 2} onTimeUpdate={avancementVideo} onEnded={finVideo} />
                ) : (
                  <img key={`${pos}-${courant.slide.mediaUrl}`} src={courant.slide.mediaUrl} alt=""
                    className="h-full w-full animate-[fadeUp_0.4s_ease-out_both] object-cover" />
                )
              ) : (
                <div className="flex h-full min-h-48 w-full items-center justify-center text-white/80">
                  <Megaphone size={56} strokeWidth={1.5} aria-hidden="true" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent" />

              {/* Barres de progression facon "stories" : une par slide de la chaine. */}
              <div className="absolute inset-x-3 top-3 flex gap-1 pr-12 sm:pr-0" aria-hidden="true">
                {Array.from({ length: slidesChaine }, (_, i) => (
                  <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
                    <span key={`${pos}-${i}`} ref={i === courant.numSlide && video ? barre : undefined}
                      className={`block h-full rounded-full bg-white ${i < courant.numSlide ? 'w-full' : 'w-0'}`}
                      style={i === courant.numSlide && !video
                        ? (survol ? { width: '50%' } : { animation: `loading ${DUREE}ms linear forwards` })
                        : undefined} />
                  </span>
                ))}
              </div>

              {video && (
                <button type="button" onClick={() => setSon((s) => !s)} aria-label={son ? 'Couper le son' : 'Activer le son'}
                  className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                  {son ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
                </button>
              )}
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div key={pos} className="min-h-0 flex-1 animate-[fadeUp_0.35s_ease-out_both] overflow-y-auto px-5 pb-3 pt-5 sm:pr-14 sm:pt-7">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {courant.chaine.titre}
                  {chaines.length > 1 && <span className="ml-1 font-semibold text-ink-light">· {courant.numChaine + 1}/{chaines.length}</span>}
                </p>
                <h2 className="titre-display text-[32px] sm:text-4xl">{courant.slide.titre}</h2>
                {courant.slide.message && <p className="mt-3 text-[15px] leading-relaxed text-ink-light">{courant.slide.message}</p>}
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button type="button" aria-label="Annonce précédente" disabled={total < 2} onClick={() => aller(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30">
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Annonces">
                  {sequence.map((x, i) => (
                    <button key={`${x.chaine.id}-${x.numSlide}`} type="button" role="tab" aria-selected={i === pos}
                      aria-label={`${x.chaine.titre} : ${x.slide.titre}`}
                      onClick={() => { setIndex(i); setPauseJusqua(Date.now() + PAUSE_APRES_ACTION); }}
                      className={`h-2.5 rounded-full transition-all ${i === pos ? 'w-6 bg-primary' : 'w-2.5 bg-line hover:bg-ink-light/40'}`} />
                  ))}
                </div>
                <button type="button" aria-label="Annonce suivante" disabled={total < 2} onClick={() => aller(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink disabled:opacity-30">
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center">
            <Megaphone size={40} strokeWidth={1.5} className="mx-auto mb-3 text-ink-light" aria-hidden="true" />
            <p className="text-sm text-ink-light">Aucune annonce pour le moment.</p>
            <button type="button" onClick={fermer} className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white">Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
}
