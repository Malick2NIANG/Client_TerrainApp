import { formaterSaisieLocale } from '../utils/telephone';

// Telephone en deux cases : l'indicatif +221 fixe (lecture seule) et le
// numero a 9 chiffres, mis en forme pendant la frappe. Le client ne tape
// jamais l'indicatif.
export default function ChampTelephone({ id, valeur, onChange, label = 'Téléphone', aide, erreur, disabled = false }) {
  return (
    <div className="text-sm">
      <label htmlFor={id} className="font-semibold">{label}</label>
      <div className="mt-1 flex gap-2">
        <input value="+221" readOnly tabIndex={-1} aria-label="Indicatif du Sénégal"
          className="h-12 w-[4.75rem] shrink-0 cursor-default rounded-md border border-line bg-surface-alt px-2 text-center font-semibold text-ink-light outline-none" />
        <input id={id} value={valeur} onChange={(e) => onChange(formaterSaisieLocale(e.target.value))} disabled={disabled}
          inputMode="numeric" autoComplete="tel-national" placeholder="77 123 45 67" maxLength={12} aria-invalid={Boolean(erreur)}
          className="h-12 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-base tracking-wide outline-none focus:border-primary disabled:bg-surface-alt" />
      </div>
      {erreur ? <span className="mt-1 block text-xs text-danger">{erreur}</span>
        : aide && <span className="mt-1 block text-xs text-ink-light">{aide}</span>}
    </div>
  );
}
