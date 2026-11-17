import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, LayoutGrid } from 'lucide-react';

const onglets = [
  { to: '/', label: 'Accueil', Icon: Home },
  { to: '/terrains', label: 'Nos terrains', Icon: LayoutGrid },
  { to: '/mes-reservations', label: 'Mes réservations', Icon: CalendarCheck },
];

export default function NavBar() {
  return (
    <nav aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {onglets.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
              isActive ? 'font-semibold text-primary' : 'text-ink-light'}`}>
            <Icon size={22} strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
