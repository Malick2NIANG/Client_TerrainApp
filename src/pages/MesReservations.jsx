import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { getHistorique, getReservation } from '../api/reservations';
import BadgeStatut from '../components/BadgeStatut';
import { Squelette } from '../components/EtatChargement';
import { useMesReservations } from '../context/MesReservationsContext';
import { dateLongue, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { normaliserTelephone } from '../utils/telephone';

const PAR_PAGE = 10;

function Ligne({ r, lien }) {
  const contenu = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{r.terrain} · {r.sport}</p>
        <p className="text-sm capitalize text-ink-light">{dateLongue(r.debut)} · {plage(r.debut, r.fin)}</p>
        <p className="text-sm">{formatPrix(r.montant)} · <span className="font-mono text-xs">{r.reference}</span></p>
      </div>
      <BadgeStatut code={r.statut} />
      {lien && <ChevronRight size={18} className="shrink-0 text-ink-light" aria-hidden="true" />}
    </>
  );
  const classe = 'flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-card';
  return lien ? <Link to={lien} className={`${classe} hover:shadow-float`}>{contenu}</Link> : <div className={classe}>{contenu}</div>;
}

export default function MesReservations() {
  const { liste } = useMesReservations();
  const [locales, setLocales] = useState(null);
  const [nb, setNb] = useState(PAR_PAGE);
  const [telephone, setTelephone] = useState('');
  const [historique, setHistorique] = useState(null);
  const [erreurRecherche, setErreurRecherche] = useState(null);

  useEffect(() => {
    let actif = true;
    Promise.all(liste.slice(0, 30).map((r) => getReservation(r.id, r.jeton).catch(() => null)))
      .then((rs) => actif && setLocales(rs.filter(Boolean).sort((a, b) => new Date(b.debut) - new Date(a.debut))));
    return () => {
      actif = false;
    };
  }, [liste]);

  const maintenant = Date.now();
  const aVenir = (locales || []).filter((r) => new Date(r.fin).getTime() > maintenant && ['CONFIRMEE', 'EN_ATTENTE_PAIEMENT'].includes(r.statut))
    .sort((a, b) => new Date(a.debut) - new Date(b.debut));
  const passees = (locales || []).filter((r) => !aVenir.includes(r));

  const chercher = async (e) => {
    e.preventDefault();
    const tel = normaliserTelephone(telephone);
    if (!tel) {
      setErreurRecherche('Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).');
      return;
    }
    setErreurRecherche(null);
    try {
      setHistorique(await getHistorique(tel));
    } catch (err) {
      setErreurRecherche(err.message);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 md:pt-6">
      <h1 className="text-2xl font-bold">Mes réservations</h1>

      {locales === null ? (
        <div className="mt-4 space-y-3"><Squelette className="h-24 rounded-lg" /><Squelette className="h-24 rounded-lg" /></div>
      ) : locales.length === 0 ? (
        <p className="mt-4 rounded-md bg-surface-alt p-6 text-center text-sm text-ink-light">
          Aucune réservation sur ce téléphone. <Link to="/" className="font-semibold text-primary underline">Réserver un terrain</Link>
        </p>
      ) : (
        <>
          {aVenir.length > 0 && (
            <section className="mt-4">
              <h2 className="mb-2 font-bold">À venir</h2>
              <ul className="space-y-3">{aVenir.map((r) => <li key={r.id}><Ligne r={r} lien={`/reservations/${r.id}`} /></li>)}</ul>
            </section>
          )}
          {passees.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 font-bold">Historique</h2>
              <ul className="space-y-3">{passees.slice(0, nb).map((r) => <li key={r.id}><Ligne r={r} lien={`/reservations/${r.id}`} /></li>)}</ul>
              {passees.length > nb && (
                <button type="button" onClick={() => setNb((n) => n + PAR_PAGE)} className="mt-3 w-full rounded-full border border-line py-2.5 text-sm font-semibold">
                  Afficher plus
                </button>
              )}
            </section>
          )}
        </>
      )}

      <section className="mt-8 rounded-lg bg-surface-alt p-4">
        <h2 className="font-bold">Réservé depuis un autre téléphone ?</h2>
        <p className="mt-1 text-sm text-ink-light">Retrouvez vos réservations avec votre numéro (sans ticket : il reste sur le téléphone qui a réservé).</p>
        <form onSubmit={chercher} className="mt-3 flex gap-2">
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} inputMode="tel" placeholder="77 123 45 67"
            aria-label="Numéro de téléphone" className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 outline-none focus:border-primary" />
          <button type="submit" aria-label="Rechercher" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-white">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
        {erreurRecherche && <p className="mt-2 text-xs text-danger">{erreurRecherche}</p>}
        {historique && (
          historique.length === 0
            ? <p className="mt-3 text-sm text-ink-light">Aucune réservation pour ce numéro.</p>
            : <ul className="mt-3 space-y-2">{historique.map((r) => <li key={r.id}><Ligne r={r} /></li>)}</ul>
        )}
      </section>
    </main>
  );
}
