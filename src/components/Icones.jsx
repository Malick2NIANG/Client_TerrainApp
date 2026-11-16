import {
  Armchair, Check, CircleParking, CupSoda, Lightbulb, Lock, Shirt, ShowerHead, Trophy, Volleyball, Wifi,
} from 'lucide-react';
import { normaliser } from '../utils/recherche';

// Icones propres a l'app (pas d'equivalent dans lucide) : meme trait que lucide.
function Trait({ size = 18, className = '', children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconeBallon(props) {
  return (
    <Trait {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.5 3.4 2.5-1.3 4h-4.2l-1.3-4Z" />
      <path d="M12 7.5V3.2M15.4 10l4-1.5M14.1 14l2.6 3.6M9.9 14l-2.6 3.6M8.6 10l-4-1.5" />
    </Trait>
  );
}

export function IconeRaquette(props) {
  return (
    <Trait {...props}>
      <ellipse cx="14" cy="9" rx="6" ry="6.5" transform="rotate(35 14 9)" />
      <path d="m9.6 13.6-6.1 6.1M11 12.2 8.8 14.4" />
      <circle cx="19.5" cy="19.5" r="1.5" />
    </Trait>
  );
}

export function IconeBasket(props) {
  return (
    <Trait {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M5.6 5.6c2.6 2.6 2.6 10.2 0 12.8M18.4 5.6c-2.6 2.6-2.6 10.2 0 12.8" />
    </Trait>
  );
}

/** Icone d'un sport d'apres son nom (Football 5, Padel, Basket...). */
export function IconeSport({ nom, ...props }) {
  const n = normaliser(nom);
  if (/foot|soccer|futsal/.test(n)) return <IconeBallon {...props} />;
  if (/padel|tennis|squash|badminton/.test(n)) return <IconeRaquette {...props} />;
  if (/basket/.test(n)) return <IconeBasket {...props} />;
  if (/volley|hand/.test(n)) return <Volleyball size={props.size || 18} className={props.className} aria-hidden="true" />;
  return <Trophy size={props.size || 18} className={props.className} aria-hidden="true" />;
}

const EQUIPEMENTS = [
  [/eclairage|lumiere|led/, Lightbulb],
  [/vestiaire/, Shirt],
  [/douche/, ShowerHead],
  [/parking/, CircleParking],
  [/tribune|gradin/, Armchair],
  [/buvette|boisson|cafe|bar/, CupSoda],
  [/wifi/, Wifi],
  [/casier|consigne/, Lock],
  [/raquette/, IconeRaquette],
  [/ballon/, IconeBallon],
];

/** Icone d'un equipement d'apres son libelle (Eclairage, Vestiaires...). */
export function IconeEquipement({ libelle, size = 20, className = '' }) {
  const n = normaliser(libelle);
  const Icone = (EQUIPEMENTS.find(([motif]) => motif.test(n)) || [null, Check])[1];
  return <Icone size={size} className={className} aria-hidden="true" />;
}
