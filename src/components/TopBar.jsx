import { Link, NavLink } from 'react-router-dom';
import { Monogramme, NomMarque } from './Marque';
import { marque } from '../config/marque';
import BoutonNotif from './BoutonNotif';

const liens = [
  { to: '/', label: 'Réserver un terrain' },
  { to: '/mes-reservations', label: 'Mes réservations' },
];

// Tablette / ordinateur (>= 768 px) : barre fixe en haut.
export default function TopBar() {
  return (
    <header className="sticky top-0 z-[100] hidden border-b border-line bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link to="/" aria-label={`${marque.nom} — accueil`} className="flex shrink-0 items-center gap-2.5">
          <Monogramme className="h-10 w-10 rounded-xl text-base" />
          <NomMarque className="titre-display text-[26px]" />
        </Link>
        <nav aria-label="Menu principal" className="flex flex-1 items-center justify-end gap-1">
          {liens.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-ink-light hover:bg-surface-alt hover:text-ink'}`}>
              {label}
            </NavLink>
          ))}
          <BoutonNotif className="ml-2" />
        </nav>
      </div>
    </header>
  );
}
