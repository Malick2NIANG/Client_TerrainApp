import { dureesDe, libelleDuree, optionsDuree, resumeDurees } from '../utils/durees';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarCheck, Clock, Layers, MapPin, Navigation, QrCode, Share2, Star, Timer, Users,
} from 'lucide-react';
import { getDisponibilites, getTerrain } from '../api/terrains';
import { ecouterChangements } from '../api/tempsReel';
import ChoixJour from '../components/ChoixJour';
import GrilleCreneaux from '../components/GrilleCreneaux';
import CarrouselPhotos from '../components/CarrouselPhotos';
import MosaiquePhotos from '../components/MosaiquePhotos';
import GaleriePlein from '../components/GaleriePlein';
import Visionneuse from '../components/Visionneuse';
import { IconeEquipement, IconeSport } from '../components/Icones';
import { LogosMoyens } from '../components/LogosPaiement';
import { EtatErreur, Squelette } from '../components/EtatChargement';
import { useToast } from '../context/ToastContext';
import { dateLongue, hhmm, jourISO, plage } from '../utils/dates';
import { formatPrix } from '../utils/format';
import { libelleMedias, photosDe, tarifMin } from '../utils/recherche';
import { joursEnClair } from '../utils/tarifs';
import { lienItineraire } from '../utils/itineraire';
import { noteLisible } from '../utils/avis';
import AvisJoueurs from '../components/AvisJoueurs';
import { marque, moyensEnToutesLettres } from '../config/marque';

function Partager({ terrain, className = '' }) {
  const { showToast } = useToast();
  const partager = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: terrain.nom, text: `${terrain.nom} · ${terrain.sport}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Lien copié : envoyez-le à votre équipe.', { type: 'succes' });
      }
    } catch {
      // Partage annule par l'utilisateur : rien a signaler.
    }
  };
  return (
    <button type="button" onClick={partager} aria-label="Partager ce terrain" className={className}>
      <Share2 size={18} aria-hidden="true" />
      <span className="hidden md:inline">Partager</span>
    </button>
  );
}

function Fait({ Icone, titre, texte }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-ink">{Icone}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{titre}</span>
        <span className="block truncate text-sm text-ink-light">{texte}</span>
      </span>
    </li>
  );
}

const Titre = ({ children, id }) => <h2 id={id} className="text-xl font-bold">{children}</h2>;

export default function Terrain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [terrain, setTerrain] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [jour, setJour] = useState(jourISO());
  const [creneaux, setCreneaux] = useState(null);
  const [choisi, setChoisi] = useState(null);
  const [duree, setDuree] = useState(null);
  const [dispo, setDispo] = useState(null);
  const [galerie, setGalerie] = useState(null);
  const [visionneuse, setVisionneuse] = useState(null);
  const blocCreneaux = useRef(null);
  const blocDuree = useRef(null);

  const chargerTerrain = useCallback((frais) => {
    getTerrain(id, frais).then(setTerrain).catch((e) => {
      // Depublie ou archive pendant la consultation : on l'annonce.
      if (e.status === 404) setTerrain(null);
      setErreur(e.message);
    });
  }, [id]);

  useEffect(() => {
    chargerTerrain();
  }, [chargerTerrain]);

  const chargerCreneaux = useCallback(() => {
    getDisponibilites(jour, id)
      .then((d) => {
        const liste = d[0]?.creneaux || [];
        setDispo(d[0] || null);
        setCreneaux(liste);
        // Le creneau choisi vient d'etre pris par quelqu'un d'autre : on le retire.
        setChoisi((c) => (c && liste.some((x) => x.debut === c.debut && x.etat === 'LIBRE') ? c : null));
      })
      .catch((e) => setErreur(e.message));
  }, [jour, id]);

  useEffect(() => {
    setCreneaux(null);
    setChoisi(null);
    chargerCreneaux();
    return ecouterChangements(['disponibilites', 'terrains'], (sujet) => {
      chargerCreneaux();
      if (sujet === 'terrains') chargerTerrain(true);
    });
  }, [chargerCreneaux, chargerTerrain]);

  if (erreur && !terrain) {
    return <main className="mx-auto max-w-3xl p-4"><EtatErreur titre="Ce terrain n'est pas disponible" message={erreur} onReessayer={() => window.location.reload()} /></main>;
  }

  const photos = photosDe(terrain);
  const versCreneaux = () => blocCreneaux.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const durees = dureesDe(terrain, dispo);
  const options = choisi ? optionsDuree(creneaux, choisi.debut, durees) : [];
  // La duree retenue, ou la premiere qui tient (si celle choisie vient d'etre prise).
  const option = options.find((o) => o.minutes === duree && o.possible) || options.find((o) => o.possible);
  const periode = choisi && option ? { debut: choisi.debut, fin: option.fin, prix: option.prix, dureeMinutes: option.minutes } : null;
  const choisir = (c) => {
    setChoisi(c);
    // Plusieurs durees : on amene le choix de duree a l'ecran, sous la grille.
    if (durees.length > 1) requestAnimationFrame(() => blocDuree.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };
  const reserver = () => (periode ? navigate('/reserver', { state: { terrain, creneau: periode } }) : versCreneaux());
  const min = terrain ? tarifMin(terrain) : 0;

  const prixEtAction = (
    <>
      <div className="min-w-0 flex-1">
        {periode ? (
          <>
            <p className="truncate text-[15px] font-bold">{formatPrix(periode.prix)}</p>
            <p className="truncate text-sm text-ink-light first-letter:uppercase">{dateLongue(periode.debut)} · {plage(periode.debut, periode.fin)}</p>
          </>
        ) : terrain ? (
          <>
            <p className="truncate text-[15px]">
              {min < terrain.tarifHeure && <span className="text-ink-light">dès </span>}
              <span className="font-bold">{formatPrix(min)}</span><span className="text-ink-light"> / heure</span>
            </p>
            <p className="truncate text-sm text-ink-light">Choisissez un créneau</p>
          </>
        ) : <Squelette className="h-5 w-32 rounded" />}
      </div>
      <button type="button" onClick={reserver} disabled={!terrain}
        className="h-12 shrink-0 rounded-xl bg-primary px-6 text-[15px] font-semibold text-white shadow-card transition-colors hover:bg-primary-dark disabled:opacity-60">
        {periode ? 'Réserver' : 'Voir les créneaux'}
      </button>
    </>
  );

  return (
    <main className="mx-auto max-w-6xl md:px-6">
      <div className="flex flex-col">
        {/* Telephone : photos d'abord, en plein largeur. */}
        <div className="relative md:hidden">
          <CarrouselPhotos photos={photos} alt={terrain?.nom || ''} ratio="aspect-[4/3]" onOuvrir={setVisionneuse}>
            {photos.length > 0 && (
              <button type="button" onClick={() => setGalerie(0)} aria-label={`Voir les ${libelleMedias(photos)}`}
                className="absolute bottom-3 right-3 rounded-md bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                {libelleMedias(photos)}
              </button>
            )}
          </CarrouselPhotos>
          <Link to="/terrains" aria-label="Retour aux terrains"
            className="absolute left-4 top-[calc(0.75rem+env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-card">
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          {terrain && (
            <Partager terrain={terrain}
              className="absolute right-4 top-[calc(0.75rem+env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-card" />
          )}
        </div>

        {/* En-tete de l'annonce. */}
        <header className="px-5 pt-5 md:mt-6 md:px-0 md:pt-0">
          <Link to="/terrains" className="mb-4 hidden items-center gap-1.5 text-sm font-semibold text-ink-light hover:text-ink md:inline-flex">
            <ArrowLeft size={16} aria-hidden="true" /> Tous les terrains
          </Link>
          {terrain ? (
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <IconeSport nom={terrain.sport} size={16} /> {terrain.sport}
                </p>
                <h1 className="titre-display mt-1 text-[40px] md:text-5xl">{terrain.nom}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-light">
                  {terrain.nombreAvis > 0 && (
                    <a href="#avis" className="inline-flex items-center gap-1 font-semibold text-ink underline-offset-4 hover:underline">
                      <Star size={15} className="fill-ink text-ink" aria-hidden="true" /> {noteLisible(terrain.noteMoyenne)} · {terrain.nombreAvis} avis
                    </a>
                  )}
                  {terrain.localite && (
                    <span className="inline-flex items-center gap-1.5"><MapPin size={16} aria-hidden="true" /> {terrain.localite}</span>
                  )}
                </p>
              </div>
              <Partager terrain={terrain}
                className="hidden shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline-offset-4 hover:bg-surface-alt hover:underline md:inline-flex" />
            </div>
          ) : (
            <div className="space-y-2"><Squelette className="h-4 w-24 rounded" /><Squelette className="h-9 w-56 rounded" /></div>
          )}
        </header>

        {/* Ordinateur / tablette : mosaique de photos. */}
        <div className="mt-6 hidden md:block">
          {terrain ? <MosaiquePhotos photos={photos} titre={terrain.nom} onOuvrir={setVisionneuse} onToutVoir={() => setGalerie(0)} /> : <Squelette className="aspect-[21/9] rounded-xl" />}
        </div>
      </div>

      <div className="px-5 pb-4 md:px-0 md:pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div className="min-w-0">
          {terrain && (
            <>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-b border-line pb-7 sm:grid-cols-4 md:mt-8">
                <Fait Icone={<Users size={20} aria-hidden="true" />} titre={`${terrain.capacite} joueurs`} texte="Capacité" />
                <Fait Icone={<Timer size={20} aria-hidden="true" />} titre={resumeDurees(durees)} texte={durees.length > 1 ? 'Durée au choix' : 'Par créneau'} />
                {terrain.surface && <Fait Icone={<Layers size={20} aria-hidden="true" />} titre={terrain.surface} texte="Surface" />}
                <Fait Icone={<QrCode size={20} aria-hidden="true" />} titre="Ticket QR" texte="Sans compte" />
              </ul>

              {terrain.description && (
                <section className="border-b border-line py-7">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed">{terrain.description}</p>
                </section>
              )}

              {terrain.equipements.length > 0 && (
                <section className="border-b border-line py-7" aria-labelledby="equipements">
                  <Titre id="equipements">Ce que propose ce terrain</Titre>
                  <ul className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {terrain.equipements.map((e) => (
                      <li key={e} className="flex items-center gap-4 text-[15px]">
                        <IconeEquipement libelle={e} size={22} className="shrink-0 text-ink" /> {e}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="border-b border-line py-7" aria-labelledby="tarifs">
                <Titre id="tarifs">Tarifs</Titre>
                <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
                  <li className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span><span className="block font-semibold">Tarif de base</span><span className="text-sm text-ink-light">Hors plages ci-dessous</span></span>
                    <span className="whitespace-nowrap font-bold">{formatPrix(terrain.tarifHeure)}<span className="font-normal text-ink-light"> / h</span></span>
                  </li>
                  {terrain.plages.map((p) => (
                    <li key={p.id ?? `${p.libelle}-${p.debut}`} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <span>
                        <span className="block font-semibold">{p.libelle}</span>
                        <span className="text-sm text-ink-light">{joursEnClair(p.jours)} · {hhmm(p.debut)} – {hhmm(p.fin)}</span>
                      </span>
                      <span className="whitespace-nowrap font-bold">{formatPrix(p.tarifHeure)}<span className="font-normal text-ink-light"> / h</span></span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-ink-light">
                  {durees.length > 1
                    ? `Durées proposées : ${durees.map(libelleDuree).join(', ')}. Le prix est calculé au prorata, selon l’heure de début.`
                    : `Le prix d’un créneau de ${terrain.dureeCreneauMinutes} min est calculé au prorata, selon l’heure de début.`}
                </p>
              </section>
            </>
          )}

          <section ref={blocCreneaux} className="scroll-mt-24 py-7" aria-labelledby="creneaux">
            <Titre id="creneaux">{durees.length > 1 ? 'Choisissez votre heure et votre durée' : 'Choisissez un créneau'}</Titre>
            <div className="mt-4"><ChoixJour valeur={jour} onChange={setJour} /></div>
            <div className="mt-4">
              {creneaux === null ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 9 }, (_, i) => <Squelette key={i} className="h-14 rounded-md" />)}
                </div>
              ) : (
                <>
                  <GrilleCreneaux creneaux={creneaux} choisi={choisi?.debut} finChoisie={periode?.fin} onChoisir={choisir} />
                  {choisi && durees.length > 1 && (
                    <div ref={blocDuree} className="mt-5 scroll-mb-28" role="radiogroup" aria-label="Durée de location">
                      <p className="mb-2 text-sm font-semibold">Durée</p>
                      <div className="flex flex-wrap gap-2">
                        {options.map((o) => {
                          const actif = option?.minutes === o.minutes;
                          return (
                            <button key={o.minutes} type="button" role="radio" aria-checked={actif} disabled={!o.possible}
                              onClick={() => setDuree(o.minutes)}
                              className={`flex min-w-[88px] flex-col items-center rounded-md border px-3 py-2 text-sm transition-colors ${
                                actif ? 'border-primary bg-primary text-white shadow-card'
                                  : o.possible ? 'border-line bg-surface hover:border-primary/50'
                                    : 'cursor-not-allowed border-transparent bg-surface-alt text-ink-light/60'}`}>
                              <span className="font-semibold">{libelleDuree(o.minutes)}</span>
                              <span className={`text-[11px] ${actif ? 'text-white/85' : 'text-ink-light'}`}>{o.possible ? formatPrix(o.prix) : 'Indisponible'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {terrain && <AvisJoueurs terrain={terrain} />}

          {terrain && lienItineraire(terrain) && (
            <section className="border-t border-line py-7" aria-labelledby="acces">
              <Titre id="acces">Comment venir</Titre>
              <div className="mt-4 flex flex-col gap-4 rounded-xl bg-surface-alt p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-3 text-[15px]">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{terrain.localite || marque.nom}</span>
                    {marque.adresse && <span className="block text-sm text-ink-light">{marque.adresse}</span>}
                  </span>
                </p>
                <a href={lienItineraire(terrain)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--marque-nuit))] px-5 text-sm font-semibold text-white">
                  <Navigation size={17} aria-hidden="true" /> Itinéraire
                </a>
              </div>
            </section>
          )}

          <section className="border-t border-line py-7" aria-labelledby="savoir">
            <Titre id="savoir">Bon à savoir</Titre>
            <ul className="mt-4 space-y-3 text-[15px]">
              <li className="flex gap-3"><CalendarCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" /> Réservation confirmée dès le paiement : le créneau est à vous.</li>
              <li className="flex gap-3"><QrCode size={20} className="mt-0.5 shrink-0" aria-hidden="true" /> Présentez le ticket QR (ou sa référence) à l’entrée.</li>
              <li className="flex gap-3"><Clock size={20} className="mt-0.5 shrink-0" aria-hidden="true" /> Arrivez 10 minutes avant le début pour vous changer.</li>
              {marque.delaiAnnulationHeures && (
                <li className="flex gap-3"><CalendarCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" /> Annulation possible jusqu’à {marque.delaiAnnulationHeures} h avant le créneau, auprès du complexe.</li>
              )}
            </ul>
          </section>
        </div>

        {/* Ordinateur : carte de reservation qui suit le defilement. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 mt-8 rounded-xl border border-line p-6 shadow-float">
            <div className="flex flex-col gap-4">{prixEtAction}</div>
            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4 text-sm text-ink-light">
              <span className="flex -space-x-2 [&>span]:h-7 [&>span]:w-7 [&>span]:ring-2 [&>span]:ring-white"><LogosMoyens /></span>
              {moyensEnToutesLettres()}
            </div>
          </div>
        </aside>
      </div>

      {/* Telephone / tablette : barre de reservation en bas. */}
      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-surface/95 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">{prixEtAction}</div>
      </div>

      {galerie !== null && terrain && (
        <GaleriePlein photos={photos} titre={terrain.nom} depart={galerie} onFermer={() => setGalerie(null)}
          onOuvrir={setVisionneuse} actif={visionneuse === null} />
      )}
      {visionneuse !== null && terrain && (
        <Visionneuse medias={photos} titre={terrain.nom} depart={visionneuse} onFermer={() => setVisionneuse(null)} />
      )}
    </main>
  );
}
