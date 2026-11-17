import { Bell } from 'lucide-react';
import { useNotif } from '../context/NotifContext';

/** Cloche des annonces : rouvre la popup ; pastille = annonces pas encore vues. */
export default function BoutonNotif({ className = '', sombre = false }) {
  const { chaines, nbNouveautes, ouvrir } = useNotif();
  if (!chaines.length) return null;
  return (
    <button type="button" onClick={ouvrir}
      aria-label={nbNouveautes > 0 ? `Voir les annonces (${nbNouveautes} nouvelle${nbNouveautes > 1 ? 's' : ''})` : 'Voir les annonces'}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 ${
        sombre ? 'bg-white/15 text-white backdrop-blur hover:bg-white/25' : 'border border-line bg-surface text-ink hover:bg-surface-alt'} ${className}`}>
      <Bell size={19} strokeWidth={2.2} aria-hidden="true" />
      {nbNouveautes > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-light px-1 text-[10px] font-bold text-ink">
          {nbNouveautes}
        </span>
      )}
    </button>
  );
}
