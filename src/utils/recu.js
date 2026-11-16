// Recu PDF d'une reservation payee : recu de paiement + details de la
// reservation + QR code du ticket (a presenter a l'entree, meme sans
// l'app). Genere dans le navigateur : bibliotheques chargees a la demande.
import { marque, nomEnDeuxTons } from '../config/marque';
import { dateLongue, plage } from './dates';
import { formatPrix } from './format';
import { formaterTelephone } from './telephone';
import { lienItineraire } from './itineraire';

export const MOYENS = {
  wave: 'Wave',
  'orange-money': 'Orange Money',
  'mixx-yas': 'Mixx by Yas',
  carte: 'Carte bancaire',
  especes: 'Espèces',
};

/** Polices standard du PDF (WinAnsi) : espaces fines et guillemets courbes remplaces. */
export const pdfTexte = (t) => String(t ?? '')
  .replace(/[  ]/g, ' ')
  .replace(/[’‘]/g, "'")
  .replace(/[–—]/g, '-')
  .replace(/[«»]/g, '"');

/** "+221771234567" -> "77 *** ** 67" (le recu peut circuler). */
export function telephoneMasque(tel) {
  const t = formaterTelephone(tel);
  return t.length === 12 ? `${t.slice(0, 2)} *** ** ${t.slice(10)}` : '';
}

const DATE_HEURE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', dateStyle: 'long', timeStyle: 'short' });

/** Lignes du recu (testees a part du dessin). */
export function lignesRecu(r) {
  return [
    ['Référence', r.reference],
    ['Terrain', `${r.terrain} · ${r.sport}`],
    r.localite && ['Lieu', r.localite],
    ['Date', dateLongue(r.debut).replace(/^./, (c) => c.toUpperCase())],
    ['Créneau', plage(r.debut, r.fin)],
    r.clientNom && ['Client', r.clientNom],
    r.clientTelephone && ['Téléphone', telephoneMasque(r.clientTelephone)],
    ['Paiement', MOYENS[r.moyenPaiement] || r.moyenPaiement],
    r.payeeLe && ['Payé le', DATE_HEURE.format(new Date(r.payeeLe))],
  ].filter(Boolean);
}

function rgb(hexOuTableau) {
  return Array.isArray(hexOuTableau) ? hexOuTableau : [31, 122, 77];
}

/** Telecharge le recu PDF de la reservation (statut CONFIRMEE ou HONOREE). */
export async function telechargerRecu(r) {
  const [{ jsPDF }, QRCode] = await Promise.all([import('jspdf'), import('qrcode')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const L = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const couleur = rgb(marque.couleurRgb);
  const nuit = couleur.map((c) => Math.round(c * 0.25));
  const T = pdfTexte;

  // En-tete aux couleurs du complexe.
  doc.setFillColor(...nuit);
  doc.rect(0, 0, L, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(18);
  const { debut, accent } = nomEnDeuxTons();
  doc.text(T(debut.toUpperCase()), 10, 14);
  if (accent) {
    doc.setTextColor(...rgb(marque.couleurClaireRgb));
    doc.text(T(accent.toUpperCase()), 10 + doc.getTextWidth(T(debut.toUpperCase())), 14);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(T('Reçu de paiement et ticket d’entrée'), 10, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(T('PAYÉ'), L - 10, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(T(r.reference), L - 10, 22, { align: 'right' });

  // Montant.
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(9);
  doc.text(T('Montant payé'), 10, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...couleur);
  doc.text(T(formatPrix(r.montant)), 10, 51);

  // Details.
  let y = 62;
  doc.setFontSize(9);
  for (const [libelle, valeur] of lignesRecu(r)) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 110, 110);
    doc.text(T(libelle), 10, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    const lignes = doc.splitTextToSize(T(valeur), 62);
    doc.text(lignes, 34, y);
    y += 6 * lignes.length;
  }

  // QR code du ticket.
  const qr = await QRCode.toDataURL(r.codeTicket, { errorCorrectionLevel: 'M', margin: 1, width: 480 });
  const tailleQr = 46;
  const xQr = L - 10 - tailleQr;
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(xQr - 2, 38, tailleQr + 4, tailleQr + 14, 2, 2, 'S');
  doc.addImage(qr, 'PNG', xQr, 40, tailleQr, tailleQr);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(T(r.reference), xQr + tailleQr / 2, 40 + tailleQr + 7, { align: 'center' });

  // Consignes et itineraire.
  y = Math.max(y + 4, 108);
  doc.setDrawColor(220, 220, 220);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(10, y, L - 10, y);
  doc.setLineDashPattern([], 0);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(T('À l’entrée'), 10, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  const consignes = doc.splitTextToSize(T('Présentez ce QR code (ou la référence) au contrôle, au plus tôt 30 minutes avant le début du créneau. Le ticket ne sert qu’une fois.'), L - 20);
  doc.text(consignes, 10, y + 6);
  y += 6 + consignes.length * 4.5 + 4;
  const itineraire = lienItineraire(r);
  if (itineraire) {
    doc.setTextColor(...couleur);
    doc.setFont('helvetica', 'bold');
    doc.textWithLink(T('Itinéraire jusqu’au terrain (Google Maps)'), 10, y, { url: itineraire });
    y += 6;
  }
  if (marque.adresse) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(T(marque.adresse), 10, y);
  }

  // Pied de page.
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text(T(`${marque.nom} · Document généré le ${DATE_HEURE.format(new Date())} · conservez-le jusqu’au match.`), L / 2, H - 8, { align: 'center' });

  doc.save(`recu-${r.reference}.pdf`);
}
