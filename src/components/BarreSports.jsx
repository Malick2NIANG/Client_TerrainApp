import { LayoutGrid } from 'lucide-react';
import { IconeSport } from './Icones';

// Filtre par sport facon "categories" : icone au-dessus du nom, trait sous
// le sport choisi. Defile au doigt s'il y a beaucoup de sports.
export default function BarreSports({ sports, valeur, onChange }) {
  const options = [{ id: null, nom: 'Tous' }, ...sports];
  return (
    <div role="radiogroup" aria-label="Sport"
      className="-mx-4 flex gap-7 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] sm:mx-0 sm:gap-9 sm:px-0 [&::-webkit-scrollbar]:hidden">
      {options.map((s) => {
        const actif = valeur === s.id;
        return (
          <button key={s.id ?? 'tous'} type="button" role="radio" aria-checked={actif} onClick={() => onChange(s.id)}
            className={`relative flex shrink-0 flex-col items-center gap-1.5 pb-3 pt-1 text-xs font-semibold transition-colors ${
              actif ? 'text-ink' : 'text-ink-light hover:text-ink'}`}>
            {s.id === null ? <LayoutGrid size={22} aria-hidden="true" /> : <IconeSport nom={s.nom} size={22} />}
            <span className="whitespace-nowrap">{s.nom}</span>
            <span className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-colors ${actif ? 'bg-ink' : 'bg-transparent'}`} />
          </button>
        );
      })}
    </div>
  );
}
