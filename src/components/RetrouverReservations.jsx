import { useState } from 'react';
import { ChevronDown, KeyRound, Smartphone } from 'lucide-react';
import { changerPin, demanderCodeRecuperation, retrouverReservations } from '../api/reservations';
import ChampPin from './ChampPin';
import { formaterTelephone, normaliserTelephone } from '../utils/telephone';
import { refusPin } from '../utils/pin';
import { retenirPin } from '../utils/pinMemorise';

const champ = 'mt-1 h-12 w-full rounded-md border border-line bg-surface px-3 outline-none focus:border-primary';

// Retrouver ses reservations sur un autre telephone : numero + code PIN
// (choisi a la reservation). PIN oublie : code de recuperation par SMS,
// puis nouveau PIN. Les reservations retrouvees rejoignent la liste de ce
// telephone (avec leur jeton d'acces : detail, ticket, recu).
export default function RetrouverReservations({ telephoneInitial = '', onRetrouvees, ouvertParDefaut = false }) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const [etape, setEtape] = useState('pin'); // pin | demande | code
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [nouveauPin, setNouveauPin] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [info, setInfo] = useState(null);
  const tel = normaliserTelephone(telephone);

  const executer = async (action) => {
    setErreur(null);
    setInfo(null);
    if (!tel) {
      setErreur('Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).');
      return;
    }
    setEnvoi(true);
    try {
      await action();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  const chercher = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setErreur('Le code PIN fait 4 chiffres.');
      return;
    }
    executer(async () => {
      const r = await retrouverReservations(tel, pin);
      if (!r.length) setErreur('Aucune réservation avec ce numéro et ce code PIN.');
      else { retenirPin(tel, pin); onRetrouvees(r); setPin(''); }
    });
  };

  const envoyerCode = (e) => {
    e?.preventDefault();
    executer(async () => {
      await demanderCodeRecuperation(tel);
      setEtape('code');
      setInfo(`Si ce numéro a réservé chez nous, un code à 6 chiffres vient d’être envoyé par SMS au ${formaterTelephone(tel)}.`);
    });
  };

  const valider = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setErreur('Le code reçu par SMS fait 6 chiffres.');
      return;
    }
    const refus = refusPin(nouveauPin);
    if (refus) {
      setErreur(refus);
      return;
    }
    executer(async () => {
      const r = await changerPin(tel, code, nouveauPin);
      retenirPin(tel, nouveauPin);
      onRetrouvees(r);
      setEtape('pin');
      setCode('');
      setNouveauPin('');
      setInfo('Nouveau code PIN enregistré.');
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-line" aria-labelledby="retrouver-titre">
      <h2 id="retrouver-titre">
        <button type="button" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert} aria-controls="retrouver-contenu"
          className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-alt sm:px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {etape === 'pin' ? <Smartphone size={20} aria-hidden="true" /> : <KeyRound size={20} aria-hidden="true" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{etape === 'pin' ? 'Réservé depuis un autre téléphone ?' : 'Code PIN oublié'}</span>
            <span className="block text-sm text-ink-light">Retrouvez vos réservations avec votre numéro et votre code PIN.</span>
          </span>
          <ChevronDown size={20} aria-hidden="true" className={`shrink-0 text-ink-light transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`} />
        </button>
      </h2>

      <div id="retrouver-contenu" hidden={!ouvert} className="border-t border-line px-4 pb-5 pt-1 sm:px-5">
      {etape !== 'pin' && (
        <p className="mt-3 text-sm text-ink-light">Recevez un code par SMS au numéro de la réservation, puis choisissez un nouveau code PIN.</p>
      )}

      <form onSubmit={etape === 'pin' ? chercher : etape === 'demande' ? envoyerCode : valider} noValidate className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="font-semibold">Numéro de téléphone</span>
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} inputMode="tel" autoComplete="tel"
            placeholder="77 123 45 67" disabled={etape === 'code'} className={`${champ} disabled:bg-surface-alt`} />
        </label>
        {etape === 'pin' && <ChampPin id="pin-retrouver" valeur={pin} onChange={setPin} label="Code PIN" />}
        {etape === 'code' && (
          <>
            <ChampPin id="code-sms" valeur={code} onChange={setCode} longueur={6} masque={false} label="Code reçu par SMS" autoFocus />
            <ChampPin id="nouveau-pin" valeur={nouveauPin} onChange={setNouveauPin} label="Nouveau code PIN (4 chiffres)" />
          </>
        )}

        {erreur && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">{erreur}</p>}
        {info && <p role="status" className="rounded-md bg-success/10 p-3 text-sm text-success">{info}</p>}

        <button type="submit" disabled={envoi}
          className="h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-white disabled:opacity-60">
          {envoi ? 'Un instant…' : etape === 'pin' ? 'Retrouver mes réservations' : etape === 'demande' ? 'Recevoir un code par SMS' : 'Valider le nouveau code PIN'}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
        {etape === 'pin' ? (
          <button type="button" onClick={() => { setEtape('demande'); setErreur(null); setInfo(null); }}
            className="font-semibold text-primary underline-offset-4 hover:underline">
            Code PIN oublié ?
          </button>
        ) : (
          <>
            <button type="button" onClick={() => { setEtape('pin'); setErreur(null); setInfo(null); }}
              className="font-semibold underline-offset-4 hover:underline">
              Retour
            </button>
            {etape === 'code' && (
              <button type="button" disabled={envoi} onClick={envoyerCode} className="font-semibold text-primary underline-offset-4 hover:underline">
                Renvoyer le code
              </button>
            )}
          </>
        )}
      </div>
      </div>
    </section>
  );
}
