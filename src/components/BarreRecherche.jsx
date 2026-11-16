import { useEffect, useId, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { IconeSport } from './Icones';
import { normaliser } from '../utils/recherche';

// Barre de recherche facon annonces : une seule zone (nom, quartier, sport,
// equipement), suggestions au fil de la saisie, effacement en un geste.
export default function BarreRecherche({ valeur, onChange, terrains = [], sports = [] }) {
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const champ = useRef(null);
  const idListe = useId();

  const suggestions = (() => {
    const q = normaliser(valeur);
    const toutes = [
      ...[...new Set(terrains.map((t) => t.localite).filter(Boolean))].map((l) => ({ type: 'lieu', texte: l })),
      ...sports.map((s) => ({ type: 'sport', texte: s.nom })),
      ...terrains.map((t) => ({ type: 'terrain', texte: t.nom, sport: t.sport })),
    ];
    const vues = new Set();
    return toutes
      .filter((s) => (q ? normaliser(s.texte).includes(q) && normaliser(s.texte) !== q : s.type === 'lieu'))
      .filter((s) => (vues.has(s.texte) ? false : vues.add(s.texte)))
      .slice(0, 6);
  })();

  useEffect(() => setActif(-1), [valeur]);

  const choisir = (s) => {
    onChange(s.texte);
    setOuvert(false);
    champ.current?.blur();
  };

  const clavier = (e) => {
    if (!ouvert || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActif((i) => (i + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && actif >= 0) { e.preventDefault(); choisir(suggestions[actif]); }
    else if (e.key === 'Escape') setOuvert(false);
  };

  const montrer = ouvert && suggestions.length > 0;

  return (
    <div className="relative">
      <form role="search" onSubmit={(e) => { e.preventDefault(); setOuvert(false); champ.current?.blur(); }}
        className="flex h-14 items-center gap-3 rounded-full border border-line bg-surface pl-5 pr-2 shadow-[0_6px_24px_rgba(0,0,0,0.16),0_1px_2px_rgba(0,0,0,0.08)]">
        <Search size={20} className="shrink-0 text-primary" strokeWidth={2.4} aria-hidden="true" />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Rechercher un terrain</span>
          <input ref={champ} type="search" value={valeur} enterKeyHint="search" autoComplete="off"
            role="combobox" aria-expanded={montrer} aria-controls={idListe} aria-autocomplete="list"
            aria-activedescendant={actif >= 0 ? `${idListe}-${actif}` : undefined}
            onChange={(e) => { onChange(e.target.value); setOuvert(true); }}
            onFocus={() => setOuvert(true)} onBlur={() => setTimeout(() => setOuvert(false), 150)} onKeyDown={clavier}
            placeholder="Terrain, quartier, sport…"
            className="w-full bg-transparent py-2 text-base font-medium outline-none placeholder:font-normal placeholder:text-ink-light [&::-webkit-search-cancel-button]:hidden" />
        </label>
        {valeur ? (
          <button type="button" aria-label="Effacer la recherche" onClick={() => { onChange(''); champ.current?.focus(); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt text-ink hover:bg-line">
            <X size={18} aria-hidden="true" />
          </button>
        ) : (
          <span className="hidden h-10 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white sm:flex" aria-hidden="true">
            Rechercher
          </span>
        )}
      </form>

      {montrer && (
        <ul id={idListe} role="listbox" aria-label="Suggestions"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-line bg-surface py-2 shadow-float">
          {!valeur && <li className="px-5 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-light" role="presentation">Où jouer ?</li>}
          {suggestions.map((s, i) => (
            <li key={`${s.type}-${s.texte}`} id={`${idListe}-${i}`} role="option" aria-selected={i === actif}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choisir(s)}
                className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm ${i === actif ? 'bg-surface-alt' : 'hover:bg-surface-alt'}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-ink">
                  {s.type === 'lieu' ? <MapPin size={17} aria-hidden="true" /> : <IconeSport nom={s.type === 'sport' ? s.texte : s.sport} size={17} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{s.texte}</span>
                  <span className="block text-xs text-ink-light">{s.type === 'lieu' ? 'Quartier' : s.type === 'sport' ? 'Sport' : s.sport}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
