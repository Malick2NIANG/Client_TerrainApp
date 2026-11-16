import { Clock, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { marque } from '../config/marque';
import { horaireDuJour } from '../utils/dates';
import { MixxRond, OrangeMoneyRond, WaveRond } from './LogosPaiement';

// Bloc "le complexe" : de quoi rassurer avant de reserver (ou, quand,
// comment payer, qui contacter).
export default function InfosComplexe({ horaires }) {
  const aujourdhui = horaireDuJour(horaires);
  const whatsapp = String(marque.whatsapp || '').replace(/\D/g, '');
  return (
    <section aria-labelledby="complexe-titre" className="rounded-xl bg-surface-alt p-5 sm:p-7">
      <h2 id="complexe-titre" className="titre-display text-3xl">{marque.nom}</h2>
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
            <WaveRond /><OrangeMoneyRond /><MixxRond />
          </span>
          <span><span className="block font-semibold">Paiement mobile</span><span className="text-ink-light">Wave, Orange Money, Mixx, carte</span></span>
        </li>
      </ul>
      {whatsapp && (
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-surface px-5 text-sm font-semibold hover:border-ink/40">
          <MessageCircle size={18} aria-hidden="true" /> Une question ? WhatsApp
        </a>
      )}
    </section>
  );
}
