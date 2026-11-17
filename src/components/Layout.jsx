import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import TopBar from './TopBar';
import ScrollEnHaut from './ScrollEnHaut';
import AideSheet from './AideSheet';
import EtatReseau from './EtatReseau';
import NotifPopup from './NotifPopup';

// Smartphone (< 768 px) : onglets en bas, a portee de pouce.
// Tablette / ordinateur (>= 768 px) : barre de navigation en haut.
export default function Layout() {
  const { pathname } = useLocation();
  const [aide, setAide] = useState(false);
  const fermerAide = useCallback(() => setAide(false), []);
  // Fiche terrain et reservation : barre d'action fixee en bas a la place des onglets.
  const tunnel = pathname.startsWith('/reserver') || pathname.startsWith('/terrains/');
  return (
    <>
      <ScrollEnHaut />
      <TopBar />
      <div className={`flex min-h-dvh flex-col ${tunnel ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]' : 'pb-[calc(5rem+env(safe-area-inset-bottom))]'} md:min-h-[calc(100dvh-4rem-1px)] md:pb-4`}>
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pb-2 pt-6 text-[11px] text-ink-light/80 sm:px-6">
          <span>v{__APP_VERSION__}</span>
          <button type="button" onClick={() => setAide(true)} aria-haspopup="dialog"
            className="-my-2 min-h-9 px-1 underline-offset-2 hover:underline">
            Besoin d’aide ?
          </button>
        </footer>
      </div>
      {!tunnel && <NavBar />}
      <EtatReseau />
      <AideSheet ouvert={aide} onFermer={fermerAide} />
      <NotifPopup />
    </>
  );
}
