import { libelleDuree } from '../utils/durees';
import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { reserver } from '../api/reservations';
import MoyensPaiement, { MOYENS_PAIEMENT } from '../components/MoyensPaiement';
import ChampTelephone from '../components/ChampTelephone';
import { useMesReservations } from '../context/MesReservationsContext';
import { dateLongue, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { nouvelleCle, urlPaiementSure } from '../utils/paiement';
import { telephoneDepuisLocal } from '../utils/telephone';

const CLE_CONTACT = 'terrainapp_contact_v1';

// Seuls le prenom et le nom sont retenus sur l'appareil pour pre-remplir la
// prochaine reservation ; le numero de telephone n'est jamais stocke (il est
// retire des anciennes sauvegardes qui le contenaient).
function contactMemorise() {
  try {
    const memo = JSON.parse(localStorage.getItem(CLE_CONTACT) || '{}');
    if (memo && 'telephone' in memo) {
      delete memo.telephone;
      localStorage.setItem(CLE_CONTACT, JSON.stringify(memo));
    }
    return memo || {};
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
  const [telephone, setTelephone] = useState('');
  const [moyen, setMoyen] = useState(MOYENS_PAIEMENT[0]?.id || 'wave');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [champs, setChamps] = useState({});
  // Meme cle tant que la demande ne change pas : un double appui ou une
  // coupure reseau ne reserve (et ne paie) jamais deux fois.
  const cle = useRef(nouvelleCle());

  const telNormalise = telephoneDepuisLocal(telephone);

  if (!state?.terrain || !state?.creneau) return <Navigate to="/" replace />;
  const { terrain, creneau } = state;

  const valider = async (e) => {
    e.preventDefault();
    const fautes = {};
    if (prenom.trim().length < 2) fautes.prenom = 'Indiquez votre prénom.';
    if (nom.trim().length < 2) fautes.nom = 'Indiquez votre nom.';
    if (!telNormalise) fautes.telephone = 'Numéro à 9 chiffres (ex. 77 123 45 67).';
    setChamps(fautes);
    if (Object.keys(fautes).length) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await reserver({ terrainId: terrain.id, debut: creneau.debut, clientNom: `${prenom.trim()} ${nom.trim()}`,
        clientTelephone: telNormalise, moyenPaiement: moyen, ...(creneau.dureeMinutes ? { dureeMinutes: creneau.dureeMinutes } : {}) }, cle.current);
      try {
        localStorage.setItem(CLE_CONTACT, JSON.stringify({ prenom: prenom.trim(), nom: nom.trim() }));
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
          <span className="font-semibold">{plage(creneau.debut, creneau.fin)}{creneau.dureeMinutes ? <span className="font-normal text-ink-light"> · {libelleDuree(creneau.dureeMinutes)}</span> : null}</span>
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
            aide="Pour vous joindre, et pour retrouver vos réservations sur un autre téléphone (code par SMS)." />
        </fieldset>

        <fieldset>
          <legend className="mb-3 flex items-center gap-2 font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white">2</span> Paiement
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
