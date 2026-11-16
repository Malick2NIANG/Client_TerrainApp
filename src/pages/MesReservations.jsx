import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX2, ChevronRight, Navigation, QrCode, Search, Star } from 'lucide-react';
import { getReservation } from '../api/reservations';
import BadgeStatut from '../components/BadgeStatut';
import BoutonNotif from '../components/BoutonNotif';
import RetrouverReservations from '../components/RetrouverReservations';
import { Squelette } from '../components/EtatChargement';
import { useMesReservations } from '../context/MesReservationsContext';
import { useToast } from '../context/ToastContext';
import { dateLongue, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { lienItineraire } from '../utils/itineraire';
import { normaliser } from '../utils/recherche';
import { peutNoter } from '../utils/avis';

const PAR_PAGE = 10;
const A_VENIR = ['CONFIRMEE', 'EN_ATTENTE_PAIEMENT'];
const JOUR = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', day: 'numeric' });
const MOIS = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', month: 'short' });

/** Reservation a venir : creneau pas encore termine, payee ou en attente de paiement. */
export const estAVenir = (r, maintenant = Date.now()) => A_VENIR.includes(r.statut) && new Date(r.fin).getTime() > maintenant;

/** Recherche dans l'historique : terrain, sport, reference, date. */
export function correspond(r, terme) {
  const mots = normaliser(terme).split(/\s+/).filter(Boolean);
  if (!mots.length) return true;
  const texte = normaliser([r.terrain, r.sport, r.reference, dateLongue(r.debut), r.localite].join(' '));
  return mots.every((m) => texte.includes(m));
}

function CarteAVenir({ r }) {
  const itineraire = lienItineraire(r);
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <Link to={`/reservations/${r.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-alt/60">
        <span className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[rgb(var(--marque-nuit))] text-white">
          <span className="titre-display text-2xl leading-none">{JOUR.format(new Date(r.debut))}</span>
          <span className="text-[11px] font-semibold uppercase">{MOIS.format(new Date(r.debut)).replace('.', '')}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{r.terrain}</span>
          <span className="block truncate text-sm capitalize text-ink-light">{dateLongue(r.debut)}</span>
          <span className="block text-sm font-semibold">{plage(r.debut, r.fin)}</span>
        </span>
        <BadgeStatut code={r.statut} />
      </Link>
      <div className="flex border-t border-line text-sm font-semibold">
        <Link to={`/reservations/${r.id}`} className="flex flex-1 items-center justify-center gap-2 py-3 hover:bg-surface-alt">
          <QrCode size={16} aria-hidden="true" /> {r.statut === 'CONFIRMEE' ? 'Ticket et reçu' : 'Payer'}
        </Link>
        {itineraire && (
          <a href={itineraire} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 border-l border-line py-3 hover:bg-surface-alt">
            <Navigation size={16} aria-hidden="true" /> Itinéraire
          </a>
        )}
      </div>
    </article>
  );
}

function LigneHistorique({ r }) {
  return (
    <Link to={`/reservations/${r.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-alt">
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{r.terrain} · {r.sport}</span>
        <span className="block truncate text-sm capitalize text-ink-light">{dateLongue(r.debut)} · {plage(r.debut, r.fin)}</span>
        <span className="block text-xs text-ink-light">{formatPrix(r.montant)} · <span className="font-mono">{r.reference}</span></span>
      </span>
      {peutNoter(r) ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
          <Star size={12} className="fill-current" aria-hidden="true" /> Noter
        </span>
      ) : <BadgeStatut code={r.statut} />}
      <ChevronRight size={18} className="shrink-0 text-ink-light" aria-hidden="true" />
    </Link>
  );
}

/** Liste paginee : 10 par 10, "Afficher 10 de plus". */
function ListePaginee({ elements, rendu, classeListe, cle }) {
  const [nb, setNb] = useState(PAR_PAGE);
  useEffect(() => setNb(PAR_PAGE), [cle]);
  const reste = elements.length - nb;
  return (
    <>
      <ul className={classeListe}>{elements.slice(0, nb).map(rendu)}</ul>
      {elements.length > PAR_PAGE && (
        <p className="mt-3 text-center text-xs text-ink-light">{Math.min(nb, elements.length)} sur {elements.length}</p>
      )}
      {reste > 0 && (
        <button type="button" onClick={() => setNb((n) => n + PAR_PAGE)}
          className="mt-3 h-11 w-full rounded-xl border border-ink/80 text-sm font-semibold hover:bg-surface-alt">
          Afficher {Math.min(PAR_PAGE, reste)} de plus
        </button>
      )}
    </>
  );
}

function AucunResultat({ terme, onEffacer }) {
  return (
    <div className="rounded-xl bg-surface-alt p-6 text-center text-sm text-ink-light">
      Aucune réservation ne correspond à « {terme.trim()} ».{' '}
      <button type="button" onClick={onEffacer} className="font-semibold text-ink underline">Effacer</button>
    </div>
  );
}

export default function MesReservations() {
  const { liste, ajouter } = useMesReservations();
  const { showToast } = useToast();
  const [reservations, setReservations] = useState(null);
  const [onglet, setOnglet] = useState(null); // null = automatique
  const [terme, setTerme] = useState('');

  const charger = useCallback(() => {
    let actif = true;
    Promise.all(liste.map((r) => getReservation(r.id, r.jeton).catch(() => null)))
      .then((rs) => actif && setReservations(rs.filter(Boolean)));
    return () => { actif = false; };
  }, [liste]);

  useEffect(() => charger(), [charger]);

  const maintenant = Date.now();
  // La recherche (terrain, reference, date) filtre les deux onglets.
  const trouvees = (reservations || []).filter((r) => correspond(r, terme));
  const aVenir = trouvees.filter((r) => estAVenir(r, maintenant)).sort((a, b) => new Date(a.debut) - new Date(b.debut));
  const passees = trouvees.filter((r) => !estAVenir(r, maintenant)).sort((a, b) => new Date(b.debut) - new Date(a.debut));
  const ongletActif = onglet || (aVenir.length || !passees.length ? 'a-venir' : 'historique');
  const aNoter = passees.filter((r) => peutNoter(r, maintenant)).length;

  const retrouvees = (liste2) => {
    liste2.forEach(({ reservation: r, jetonAcces }) => ajouter({ id: r.id, jeton: jetonAcces, reference: r.reference, debut: r.debut }));
    showToast(`${liste2.length} réservation${liste2.length > 1 ? 's' : ''} retrouvée${liste2.length > 1 ? 's' : ''}.`, { type: 'succes' });
  };

  const onglets = [
    { id: 'a-venir', label: 'À venir', nb: aVenir.length },
    { id: 'historique', label: aNoter ? `Historique · ${aNoter} à noter` : 'Historique', nb: passees.length },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-6 pt-[calc(1.25rem+env(safe-area-inset-top))] sm:px-6 md:pt-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="titre-display text-[44px] md:text-6xl">Mes réservations</h1>
          <p className="mt-1 text-[15px] text-ink-light">Tickets, reçus et historique, sans compte.</p>
        </div>
        <BoutonNotif className="md:hidden" />
      </header>

      {reservations === null ? (
        <div className="mt-6 space-y-3"><Squelette className="h-12 rounded-xl" /><Squelette className="h-32 rounded-xl" /><Squelette className="h-32 rounded-xl" /></div>
      ) : reservations.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-10 text-center">
          <CalendarX2 size={36} className="text-ink-light" aria-hidden="true" />
          <p className="mt-3 font-semibold">Aucune réservation sur ce téléphone</p>
          <p className="mt-1 max-w-xs text-sm text-ink-light">Réservez un terrain, ou retrouvez vos réservations faites depuis un autre téléphone ci-dessous.</p>
          <Link to="/terrains" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white">
            Voir nos terrains
          </Link>
        </div>
      ) : (
        <>
          {(
            <label className="relative mt-6 block">
              <span className="sr-only">Rechercher dans mes réservations</span>
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" aria-hidden="true" />
              <input type="search" value={terme} onChange={(e) => setTerme(e.target.value)}
                placeholder="Terrain, référence, date, quartier…"
                className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-3 outline-none focus:border-primary" />
            </label>
          )}
          <div className="mt-3 flex rounded-xl bg-surface-alt p-1" role="tablist" aria-label="Mes réservations">
            {onglets.map((o) => (
              <button key={o.id} type="button" role="tab" aria-selected={ongletActif === o.id} onClick={() => setOnglet(o.id)}
                className={`flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  ongletActif === o.id ? 'bg-surface text-ink shadow-card' : 'text-ink-light'}`}>
                {o.label}
                <span className={`ml-1.5 rounded-full px-1.5 text-xs ${ongletActif === o.id ? 'bg-primary/10 text-primary' : 'bg-line'}`}>{o.nb}</span>
              </button>
            ))}
          </div>
          <div className="mt-5" role="tabpanel">
            {ongletActif === 'a-venir' ? (
              aVenir.length ? (
                <ListePaginee elements={aVenir} cle={terme} classeListe="space-y-4"
                  rendu={(r) => <li key={r.id}><CarteAVenir r={r} /></li>} />
              ) : terme.trim() ? <AucunResultat terme={terme} onEffacer={() => setTerme('')} /> : (
                <div className="rounded-xl bg-surface-alt p-6 text-center text-sm text-ink-light">
                  Aucune réservation à venir. <Link to="/terrains" className="font-semibold text-primary underline">Réserver un terrain</Link>
                </div>
              )
            ) : passees.length ? (
              <ListePaginee elements={passees} cle={terme}
                classeListe="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
                rendu={(r) => <li key={r.id}><LigneHistorique r={r} /></li>} />
            ) : terme.trim() ? <AucunResultat terme={terme} onEffacer={() => setTerme('')} /> : (
              <div className="rounded-xl bg-surface-alt p-6 text-center text-sm text-ink-light">Pas encore d’historique.</div>
            )}
          </div>
        </>
      )}

      <div className="mt-10">
        <RetrouverReservations onRetrouvees={retrouvees} ouvertParDefaut={reservations?.length === 0} />
      </div>
    </main>
  );
}
