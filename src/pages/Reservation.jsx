import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { getReservation, relancerPaiement } from '../api/reservations';
import BadgeStatut from '../components/BadgeStatut';
import Ticket from '../components/Ticket';
import { EtatErreur, Squelette } from '../components/EtatChargement';
import { useMesReservations } from '../context/MesReservationsContext';
import { dateLongue, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { urlPaiementSure } from '../utils/paiement';

export default function Reservation() {
  const { id } = useParams();
  const { state } = useLocation();
  const { jetonDe } = useMesReservations();
  const jeton = jetonDe(id);
  const [res, setRes] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [relance, setRelance] = useState(false);

  const charger = useCallback(() => {
    if (!jeton) return;
    getReservation(id, jeton).then(setRes).catch((e) => setErreur(e.message));
  }, [id, jeton]);

  useEffect(() => {
    charger();
  }, [charger]);

  // En attente de paiement : on regarde regulierement si le paiement est arrive.
  useEffect(() => {
    if (res?.statut !== 'EN_ATTENTE_PAIEMENT') return undefined;
    const t = setInterval(charger, 4000);
    return () => clearInterval(t);
  }, [res?.statut, charger]);

  const payer = async () => {
    setRelance(true);
    try {
      const p = await relancerPaiement(Number(id), jeton);
      const page = urlPaiementSure(p.redirectUrl);
      if (page) window.location.assign(page);
      else charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setRelance(false);
    }
  };

  if (!jeton) {
    return (
      <main className="mx-auto max-w-xl p-4">
        <EtatErreur titre="Réservation introuvable sur ce téléphone"
          message="Le détail et le ticket ne s'ouvrent que sur le téléphone qui a réservé. Retrouvez vos réservations avec votre numéro."
          onReessayer={() => { window.location.href = '/mes-reservations'; }} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 md:pt-6">
      <div className="flex items-center gap-2">
        <Link to="/mes-reservations" aria-label="Mes réservations" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-alt">
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <h1 className="text-xl font-bold">Réservation {res?.reference}</h1>
      </div>

      {erreur && !res && <div className="mt-4"><EtatErreur titre="Impossible d'afficher la réservation" message={erreur} onReessayer={charger} /></div>}
      {!res && !erreur && <div className="mt-4 space-y-3"><Squelette className="h-24 rounded-lg" /><Squelette className="h-80 rounded-lg" /></div>}

      {res && (
        <div className="mt-4 space-y-4">
          {state?.nouvelle && res.statut === 'CONFIRMEE' && (
            <p className="flex items-center gap-2 rounded-md bg-success/10 p-3 text-sm font-semibold text-success">
              <CheckCircle2 size={18} aria-hidden="true" /> Paiement reçu, votre terrain est réservé !
            </p>
          )}
          <section className="rounded-lg border border-line bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{res.terrain} · {res.sport}</p>
                <p className="text-sm capitalize text-ink-light">{dateLongue(res.debut)}</p>
                <p className="text-sm font-semibold">{plage(res.debut, res.fin)}</p>
              </div>
              <BadgeStatut code={res.statut} />
            </div>
            <p className="mt-2 border-t border-line pt-2 text-sm">Montant : <strong>{formatPrix(res.montant)}</strong></p>
          </section>

          {res.statut === 'EN_ATTENTE_PAIEMENT' && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold"><Clock size={16} aria-hidden="true" /> Paiement en attente</p>
              <p className="mt-1 text-ink-light">Le créneau vous est gardé quelques minutes. Validez le paiement pour recevoir votre ticket.</p>
              <button type="button" onClick={payer} disabled={relance}
                className="mt-3 h-11 rounded-full bg-primary px-5 font-semibold text-white disabled:opacity-60">
                {relance ? 'Un instant…' : 'Payer maintenant'}
              </button>
            </section>
          )}
          {res.statut === 'EXPIREE' && (
            <p className="rounded-md bg-surface-alt p-3 text-sm">Le paiement n’est pas arrivé à temps : le créneau a été libéré. <Link to="/" className="font-semibold text-primary underline">Réserver à nouveau</Link></p>
          )}
          {res.codeTicket && <Ticket reservation={res} />}
        </div>
      )}
    </main>
  );
}
