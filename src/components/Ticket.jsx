import { QRCodeSVG } from 'qrcode.react';
import { MapPin } from 'lucide-react';
import { marque } from '../config/marque';
import { dateLongue, plage } from '../utils/dates';
import { NomMarque } from './Marque';

/** Ticket a presenter a l'entree : QR code (scanne par le controleur) et reference. */
export default function Ticket({ reservation }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="bg-primary px-5 py-3 text-white">
        <NomMarque className="text-sm font-bold tracking-wide" accentClassName="text-white/80" />
        <p className="text-xs text-white/85">Ticket d’entrée</p>
      </div>
      <div className="flex flex-col items-center gap-3 px-5 py-5">
        <div className="rounded-md bg-white p-3 shadow-card">
          <QRCodeSVG value={reservation.codeTicket} size={196} level="M" aria-label="QR code du ticket" />
        </div>
        <p className="font-mono text-lg font-bold tracking-widest">{reservation.reference}</p>
        <div className="w-full border-t border-dashed border-line pt-3 text-center">
          <p className="font-semibold">{reservation.terrain} · {reservation.sport}</p>
          <p className="text-sm capitalize text-ink-light">{dateLongue(reservation.debut)}</p>
          <p className="text-sm font-semibold">{plage(reservation.debut, reservation.fin)}</p>
        </div>
        {marque.adresse && (
          <p className="inline-flex items-center gap-1 text-xs text-ink-light">
            <MapPin size={12} aria-hidden="true" /> {marque.adresse}
          </p>
        )}
        <p className="text-center text-xs text-ink-light">Présentez ce QR code à l’entrée, au plus tôt 30 min avant.</p>
      </div>
    </div>
  );
}
