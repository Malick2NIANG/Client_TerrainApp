import { Clock, MapPin, MessageCircle, Navigation, ShieldCheck } from 'lucide-react';
import { marque, moyensEnToutesLettres } from '../config/marque';
import { horaireDuJour } from '../utils/dates';
import { lienItineraire } from '../utils/itineraire';
import { LogosMoyens } from './LogosPaiement';

const RESEAUX = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['x', 'X'],
  ['youtube', 'YouTube'],
  ['siteWeb', 'Site web'],
];

// Bloc "le complexe" : de quoi rassurer avant de reserver (ou, quand,
// comment payer, qui contacter).
export default function InfosComplexe({ horaires }) {
  const aujourdhui = horaireDuJour(horaires);
  const whatsapp = String(marque.whatsapp || '').replace(/\D/g, '');
  const itineraire = marque.gps || marque.adresse ? lienItineraire({}) : null;
  const reseaux = RESEAUX.filter(([cle]) => /^https:\/\//.test(marque.reseauxSociaux[cle] || ''));
  return (
    <section aria-labelledby="complexe-titre" className="rounded-xl bg-surface-alt p-5 sm:p-7">
      <h2 id="complexe-titre" className="titre-display text-3xl">{marque.nomComplexe}</h2>
      {marque.aPropos && <p className="mt-2 max-w-3xl text-[15px] text-ink-light">{marque.aPropos}</p>}
      <ul className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {marque.adresse && (
          <li className="flex gap-3">
            <MapPin size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span><span className="block font-semibold">Adresse</span><span className="text-ink-light">{marque.adresse}</span></span>
          </li>
        )}
        {horaires && (
          <li className="flex gap-3">
            <Clock size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="block font-semibold">{aujourdhui ? 'Ouvert aujourd’hui' : 'Fermé aujourd’hui'}</span>
              {aujourdhui && <span className="text-ink-light">{aujourdhui}</span>}
            </span>
          </li>
        )}
        <li className="flex gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <span><span className="block font-semibold">Sans compte</span><span className="text-ink-light">Ticket QR envoyé tout de suite</span></span>
        </li>
        <li className="flex gap-3">
          <span className="flex shrink-0 -space-x-3 [&>span]:h-8 [&>span]:w-8 [&>span]:ring-2 [&>span]:ring-surface-alt">
            <LogosMoyens />
          </span>
          <span><span className="block font-semibold">Paiement en ligne</span><span className="text-ink-light">{moyensEnToutesLettres()}</span></span>
        </li>
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {itineraire && (
          <a href={itineraire} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark">
            <Navigation size={18} aria-hidden="true" /> Itinéraire
          </a>
        )}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-surface px-5 text-sm font-semibold hover:border-ink/40">
            <MessageCircle size={18} aria-hidden="true" /> Une question ? WhatsApp
          </a>
        )}
        {reseaux.map(([cle, libelle]) => (
          <a key={cle} href={marque.reseauxSociaux[cle]} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-full border border-ink/15 bg-surface px-5 text-sm font-semibold hover:border-ink/40">
            {libelle}
          </a>
        ))}
      </div>
    </section>
  );
}
