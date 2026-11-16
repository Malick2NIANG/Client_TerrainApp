import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { reserver } from '../api/reservations';
import MoyensPaiement from '../components/MoyensPaiement';
import ChampPin from '../components/ChampPin';
import ChampTelephone from '../components/ChampTelephone';
import { refusPin } from '../utils/pin';
import { pinRetenu, retenirPin } from '../utils/pinMemorise';
import { useMesReservations } from '../context/MesReservationsContext';
import { dateLongue, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { nouvelleCle, urlPaiementSure } from '../utils/paiement';
import { formaterSaisieLocale, formaterTelephone, telephoneDepuisLocal } from '../utils/telephone';

const CLE_CONTACT = 'terrainapp_contact_v1';

function contactMemorise() {
  try {
    return JSON.parse(localStorage.getItem(CLE_CONTACT) || '{}');
  } catch {
    return {};
  }
}

export default function Reserver() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { ajouter } = useMesReservations();
  const memo = contactMemorise();
  // Ancien format retenu ({ nom: "Awa Diop" }) : decoupe prenom / nom.
  const [prenom, setPrenom] = useState(memo.prenom ?? (memo.nom || '').split(' ')[0] ?? '');
  const [nom, setNom] = useState(memo.prenom !== undefined ? memo.nom || '' : (memo.nom || '').split(' ').slice(1).join(' '));
  const [telephone, setTelephone] = useState(() => formaterSaisieLocale(formaterTelephone(memo.telephone || '') || memo.telephone || ''));
  const [pin, setPin] = useState('');
  const [pinConnu, setPinConnu] = useState(false);
  const [moyen, setMoyen] = useState('wave');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [champs, setChamps] = useState({});
  // Meme cle tant que la demande ne change pas : un double appui ou une
  // coupure reseau ne reserve (et ne paie) jamais deux fois.
  const cle = useRef(nouvelleCle());

  const telNormalise = telephoneDepuisLocal(telephone);

  // Numero deja utilise sur ce telephone : son PIN est pre-rempli.
  useEffect(() => {
    const connu = pinRetenu(telNormalise);
    setPinConnu(Boolean(connu));
    if (connu) setPin(connu);
  }, [telNormalise]);

  if (!state?.terrain || !state?.creneau) return <Navigate to="/" replace />;
  const { terrain, creneau } = state;

  const valider = async (e) => {
    e.preventDefault();
    const fautes = {};
    if (prenom.trim().length < 2) fautes.prenom = 'Indiquez votre prénom.';
    if (nom.trim().length < 2) fautes.nom = 'Indiquez votre nom.';
    if (!telNormalise) fautes.telephone = 'Numéro à 9 chiffres (ex. 77 123 45 67).';
    const pinRefuse = refusPin(pin);
    if (pinRefuse) fautes.pin = pinRefuse;
    setChamps(fautes);
    if (Object.keys(fautes).length) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await reserver({ terrainId: terrain.id, debut: creneau.debut, clientNom: `${prenom.trim()} ${nom.trim()}`,
        clientTelephone: telNormalise, moyenPaiement: moyen, pin }, cle.current);
      try {
        localStorage.setItem(CLE_CONTACT, JSON.stringify({ prenom: prenom.trim(), nom: nom.trim(), telephone: telNormalise }));
        retenirPin(telNormalise, pin);
      } catch {
        // facultatif
      }
      const res = r.reservation;
      ajouter({ id: res.id, jeton: r.jetonSuivi, reference: res.reference, debut: res.debut });
      const page = urlPaiementSure(r.paiement?.redirectUrl);
      if (page) {
        window.location.assign(page);
        return;
      }
      navigate(`/reservations/${res.id}`, { replace: true, state: { nouvelle: true } });
    } catch (err) {
      setEnvoi(false);
      if (err.code === 'CRENEAU_PRIS' || err.code === 'CRENEAU_BLOQUE' || err.code === 'CRENEAU_PASSE') {
        setErreur({ message: err.message, retour: true });
      } else {
        // Nouvelle cle seulement si la requete a ete refusee par le serveur.
        if (err.status) cle.current = nouvelleCle();
        setErreur({ message: err.message });
      }
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 md:pt-6">
      <div className="flex items-center gap-2">
        <Link to={`/terrains/${terrain.id}`} aria-label="Changer de créneau"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-alt">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <h1 className="text-xl font-bold">Votre réservation</h1>
      </div>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{terrain.sport}</p>
        <p className="font-semibold">{terrain.nom}</p>
        <p className="text-sm capitalize text-ink-light">{dateLongue(creneau.debut)}</p>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
          <span className="font-semibold">{plage(creneau.debut, creneau.fin)}</span>
          <span className="text-lg font-bold text-primary">{formatPrix(creneau.prix)}</span>
        </div>
      </section>

      <form id="form-reservation" onSubmit={valider} noValidate className="mt-6 space-y-5">
        <fieldset className="space-y-3">
          <legend className="mb-1 flex items-center gap-2 font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white">1</span> Vos coordonnées
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-semibold">Prénom</span>
              <input value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" maxLength={40}
                aria-invalid={Boolean(champs.prenom)} className="mt-1 h-12 w-full rounded-md border border-line bg-surface px-3 outline-none focus:border-primary" />
              {champs.prenom && <span className="mt-1 block text-xs text-danger">{champs.prenom}</span>}
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Nom</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" maxLength={39}
                aria-invalid={Boolean(champs.nom)} className="mt-1 h-12 w-full rounded-md border border-line bg-surface px-3 outline-none focus:border-primary" />
              {champs.nom && <span className="mt-1 block text-xs text-danger">{champs.nom}</span>}
            </label>
          </div>
          <ChampTelephone id="telephone" valeur={telephone} onChange={setTelephone} erreur={champs.telephone}
            aide="Pour vous joindre au sujet de votre réservation." />
        </fieldset>

        <fieldset className="rounded-xl border-2 border-primary/30 bg-primary/[0.04] p-4">
          <legend className="flex items-center gap-2 px-1 font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white">2</span>
            {pinConnu ? 'Votre code PIN' : 'Créez votre code PIN'}
          </legend>
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <KeyRound size={20} aria-hidden="true" />
            </span>
            <p className="text-sm text-ink-light">
              {pinConnu
                ? 'Déjà choisi pour ce numéro sur ce téléphone : gardez le même pour retrouver toutes vos réservations ensemble.'
                : '4 chiffres à retenir. Avec votre numéro, il permet de retrouver vos réservations, tickets et reçus depuis un autre téléphone. Ne le partagez pas.'}
            </p>
          </div>
          <div className="mt-3">
            <ChampPin id="pin" valeur={pin} onChange={(v) => { setPin(v); setPinConnu(false); }} label="Code PIN (4 chiffres)"
              erreur={champs.pin} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 flex items-center gap-2 font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white">3</span> Paiement
          </legend>
          <MoyensPaiement valeur={moyen} onChange={setMoyen} telephone={telNormalise} />
        </fieldset>

        {erreur && (
          <div role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">
            <p>{erreur.message}</p>
            {erreur.retour && (
              <Link to={`/terrains/${terrain.id}`} className="mt-1 inline-block font-semibold underline">Choisir un autre créneau</Link>
            )}
          </div>
        )}
      </form>

      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
        <button type="submit" form="form-reservation" disabled={envoi}
          className="mx-auto flex h-12 w-full max-w-2xl items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white shadow-card hover:bg-primary-dark disabled:opacity-60">
          <Lock size={16} aria-hidden="true" />
          {envoi ? 'Réservation en cours…' : `Payer ${formatPrix(creneau.prix)}`}
        </button>
      </div>
    </main>
  );
}
