import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { reserver } from '../api/reservations';
import MoyensPaiement from '../components/MoyensPaiement';
import ChampPin from '../components/ChampPin';
import { refusPin } from '../utils/pin';
import { useMesReservations } from '../context/MesReservationsContext';
import { dateLongue, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { nouvelleCle, urlPaiementSure } from '../utils/paiement';
import { normaliserTelephone } from '../utils/telephone';

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
  const [nom, setNom] = useState(memo.nom || '');
  const [telephone, setTelephone] = useState(memo.telephone || '');
  const [pin, setPin] = useState('');
  const [moyen, setMoyen] = useState('wave');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [champs, setChamps] = useState({});
  // Meme cle tant que la demande ne change pas : un double appui ou une
  // coupure reseau ne reserve (et ne paie) jamais deux fois.
  const cle = useRef(nouvelleCle());

  if (!state?.terrain || !state?.creneau) return <Navigate to="/" replace />;
  const { terrain, creneau } = state;
  const telNormalise = normaliserTelephone(telephone);

  const valider = async (e) => {
    e.preventDefault();
    const fautes = {};
    if (nom.trim().length < 2) fautes.nom = 'Indiquez votre nom.';
    if (!telNormalise) fautes.telephone = 'Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).';
    const pinRefuse = refusPin(pin);
    if (pinRefuse) fautes.pin = pinRefuse;
    setChamps(fautes);
    if (Object.keys(fautes).length) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await reserver({ terrainId: terrain.id, debut: creneau.debut, clientNom: nom.trim(),
        clientTelephone: telNormalise, moyenPaiement: moyen, pin }, cle.current);
      try {
        localStorage.setItem(CLE_CONTACT, JSON.stringify({ nom: nom.trim(), telephone }));
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
          <legend className="mb-1 font-bold">Vos coordonnées</legend>
          <label className="block text-sm">
            <span className="font-semibold">Nom</span>
            <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" maxLength={80}
              aria-invalid={Boolean(champs.nom)}
              className="mt-1 h-12 w-full rounded-md border border-line bg-surface px-3 outline-none focus:border-primary" />
            {champs.nom && <span className="mt-1 block text-xs text-danger">{champs.nom}</span>}
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Téléphone</span>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} inputMode="tel" autoComplete="tel"
              placeholder="77 123 45 67" aria-invalid={Boolean(champs.telephone)}
              className="mt-1 h-12 w-full rounded-md border border-line bg-surface px-3 outline-none focus:border-primary" />
            {champs.telephone ? (
              <span className="mt-1 block text-xs text-danger">{champs.telephone}</span>
            ) : (
              <span className="mt-1 block text-xs text-ink-light">Pour vous joindre au sujet de votre réservation.</span>
            )}
          </label>
          <ChampPin id="pin" valeur={pin} onChange={setPin} label="Code PIN (4 chiffres)" erreur={champs.pin}
            aide="Choisissez-le et retenez-le : avec votre numéro, il permet de retrouver vos réservations et vos tickets sur un autre téléphone. Ne le partagez pas." />
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-bold">Paiement</legend>
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
