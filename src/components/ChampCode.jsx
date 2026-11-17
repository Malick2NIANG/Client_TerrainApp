import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Saisie d'un code a chiffres (code SMS a 6) : clavier numerique,
// chiffres masques par defaut, bouton pour les afficher.
export default function ChampCode({ valeur, onChange, longueur = 4, label, aide, erreur, masque = true, id, autoFocus }) {
  const [visible, setVisible] = useState(!masque);
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="font-semibold">{label}</span>
      <span className="relative mt-1 block">
        <input id={id} value={valeur} autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, longueur))}
          type={visible ? 'text' : 'password'} inputMode="numeric" pattern="[0-9]*" autoComplete={longueur === 6 ? 'one-time-code' : 'off'}
          maxLength={longueur} placeholder={'•'.repeat(longueur)} aria-invalid={Boolean(erreur)}
          className="h-12 w-full rounded-md border border-line bg-surface px-3 pr-12 font-mono text-lg tracking-[0.5em] outline-none focus:border-primary" />
        {masque && (
          <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Masquer le code' : 'Afficher le code'}
            className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-ink-light hover:bg-surface-alt">
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </span>
      {erreur ? <span className="mt-1 block text-xs text-danger">{erreur}</span>
        : aide && <span className="mt-1 block text-xs text-ink-light">{aide}</span>}
    </label>
  );
}
