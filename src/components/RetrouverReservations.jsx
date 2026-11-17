import { useState } from 'react';
import { ChevronDown, MessageSquareText, Smartphone } from 'lucide-react';
import { demanderCodeSms, retrouverReservations } from '../api/reservations';
import ChampCode from './ChampCode';
import ChampTelephone from './ChampTelephone';
import { formaterTelephone, telephoneDepuisLocal } from '../utils/telephone';

// Retrouver ses reservations sur un autre telephone : numero, puis code a
// 6 chiffres recu par SMS. Les reservations retrouvees rejoignent la liste
// de ce telephone (avec leur jeton d'acces : detail, ticket, recu).
export default function RetrouverReservations({ telephoneInitial = '', onRetrouvees, ouvertParDefaut = false }) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const [etape, setEtape] = useState('numero'); // numero | code
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [code, setCode] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [info, setInfo] = useState(null);
  const tel = telephoneDepuisLocal(telephone);

  const executer = async (action) => {
    setErreur(null);
    setInfo(null);
    if (!tel) {
      setErreur('Numéro à 9 chiffres (ex. 77 123 45 67).');
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

  const envoyerCode = (e) => {
    e?.preventDefault();
    executer(async () => {
      await demanderCodeSms(tel);
      setEtape('code');
      setCode('');
      setInfo(`Si ce numéro a réservé chez nous, un code à 6 chiffres vient d’être envoyé par SMS au ${formaterTelephone(tel)}.`);
    });
  };

  const valider = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setErreur('Le code reçu par SMS fait 6 chiffres.');
      return;
    }
    executer(async () => {
      const r = await retrouverReservations(tel, code);
      setEtape('numero');
      setCode('');
      if (!r.length) setInfo('Aucune réservation avec ce numéro.');
      else onRetrouvees(r);
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-line" aria-labelledby="retrouver-titre">
      <h2 id="retrouver-titre">
        <button type="button" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert} aria-controls="retrouver-contenu"
          className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-alt sm:px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {etape === 'numero' ? <Smartphone size={20} aria-hidden="true" /> : <MessageSquareText size={20} aria-hidden="true" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Réservé depuis un autre téléphone ?</span>
            <span className="block text-sm text-ink-light">Retrouvez vos réservations avec votre numéro et un code reçu par SMS.</span>
          </span>
          <ChevronDown size={20} aria-hidden="true" className={`shrink-0 text-ink-light transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`} />
        </button>
      </h2>

      <div id="retrouver-contenu" hidden={!ouvert} className="border-t border-line px-4 pb-5 pt-1 sm:px-5">
        <form onSubmit={etape === 'numero' ? envoyerCode : valider} noValidate className="mt-4 space-y-3">
          <ChampTelephone id="tel-retrouver" valeur={telephone} onChange={setTelephone} label="Numéro de téléphone"
            disabled={etape === 'code'} />
          {etape === 'code' && (
            <ChampCode id="code-sms" valeur={code} onChange={setCode} longueur={6} masque={false} label="Code reçu par SMS" autoFocus />
          )}

          {erreur && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">{erreur}</p>}
          {info && <p role="status" className="rounded-md bg-success/10 p-3 text-sm text-success">{info}</p>}

          <button type="submit" disabled={envoi}
            className="h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-white disabled:opacity-60">
            {envoi ? 'Un instant…' : etape === 'numero' ? 'Recevoir un code par SMS' : 'Voir mes réservations'}
          </button>
        </form>

        {etape === 'code' && (
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
            <button type="button" onClick={() => { setEtape('numero'); setErreur(null); setInfo(null); }}
              className="font-semibold underline-offset-4 hover:underline">
              Changer de numéro
            </button>
            <button type="button" disabled={envoi} onClick={envoyerCode} className="font-semibold text-primary underline-offset-4 hover:underline">
              Renvoyer le code
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
