// Recu PDF d'une reservation payee : recu de paiement + details de la
// reservation + QR code du ticket (a presenter a l'entree, meme sans
// l'app). Genere dans le navigateur : bibliotheques chargees a la demande.
import { marque } from '../config/marque';
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

const HEURE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', hour: '2-digit', minute: '2-digit' });
const DATE_COMPLETE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const EMIS = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Dakar', dateStyle: 'short', timeStyle: 'short' });

/**
 * Lignes du recu (testees a part du dessin) : memes rubriques que le recu
 * de caisse du comptoir (Manager), plus le lieu.
 */
export function lignesRecu(r) {
  return [
    ['Référence', r.reference],
    r.clientNom && ['Client', r.clientNom],
    ['Terrain', r.sport ? `${r.terrain} (${r.sport})` : r.terrain],
    r.localite && ['Lieu', r.localite],
    ['Date', DATE_COMPLETE.format(new Date(r.debut))],
    ['Créneau', `${HEURE.format(new Date(r.debut))} – ${HEURE.format(new Date(r.fin))}`],
    ['Paiement', MOYENS[r.moyenPaiement] || r.moyenPaiement],
    ['Montant payé', formatPrix(r.montant)],
    r.especesRecues != null && ['Espèces reçues', formatPrix(r.especesRecues)],
    r.monnaieRendue != null && ['Monnaie rendue', formatPrix(r.monnaieRendue)],
    r.payeeLe && ['Payé le', DATE_HEURE.format(new Date(r.payeeLe))],
  ].filter(Boolean);
}

const LARGEUR = 80; // ticket de caisse 80 mm, comme au comptoir
const MARGE = 5;

/** Dessine le ticket et renvoie la hauteur utilisee (meme dessin pour mesurer puis produire). */
function dessiner(doc, r, qr, itineraire) {
  const T = pdfTexte;
  const L = LARGEUR;
  const droite = L - MARGE;
  let y = 9;
  const tirets = () => {
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text('-'.repeat(38), L / 2, y, { align: 'center' });
  };

  doc.setTextColor(0, 0, 0);
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.text(T(marque.etablissement || marque.nom), L / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.text(T(`Reçu émis le ${EMIS.format(new Date())}`), L / 2, y, { align: 'center' });
  y += 5;
  tirets();
  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(T('REÇU DE PAIEMENT'), L / 2, y, { align: 'center' });
  y += 3;
  tirets();
  y += 6;

  doc.setFontSize(9);
  for (const [libelle, valeur] of lignesRecu(r)) {
    doc.setFont('courier', 'normal');
    const gauche = doc.splitTextToSize(T(libelle), 26);
    doc.text(gauche, MARGE, y);
    doc.setFont('courier', 'bold');
    const valeurs = doc.splitTextToSize(T(valeur), 42);
    valeurs.forEach((ligne, i) => doc.text(ligne, droite, y + i * 4, { align: 'right' }));
    y += 4 * Math.max(gauche.length, valeurs.length) + 1.5;
  }

  if (qr) {
    y += 2;
    doc.addImage(qr, 'PNG', (L - 38) / 2, y, 38, 38);
    y += 42;
  }
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(T(r.reference), L / 2, y, { align: 'center' });
  y += 5;
  tirets();
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  const pied = doc.splitTextToSize(T('Présentez ce reçu (QR code) à l’entrée, au plus tôt 30 minutes avant le créneau.'), L - 2 * MARGE);
  pied.forEach((ligne) => { doc.text(ligne, L / 2, y, { align: 'center' }); y += 4; });
  doc.text(T('Merci et bon match !'), L / 2, y, { align: 'center' });
  y += 5;
  if (itineraire) {
    doc.setTextColor(0, 0, 200);
    doc.textWithLink(T('Itinéraire (Google Maps)'), L / 2 - doc.getTextWidth(T('Itinéraire (Google Maps)')) / 2, y, { url: itineraire });
    doc.setTextColor(0, 0, 0);
    y += 5;
  }
  if (marque.adresse) {
    doc.text(T(marque.adresse), L / 2, y, { align: 'center' });
    y += 5;
  }
  return y + 3;
}

/** Recu PDF (ticket 80 mm) de la reservation (statut CONFIRMEE ou HONOREE). */
export async function genererRecu(r) {
  const [{ jsPDF }, QRCode] = await Promise.all([import('jspdf'), import('qrcode')]);
  const qr = r.codeTicket
    ? await QRCode.toDataURL(r.codeTicket, { errorCorrectionLevel: 'M', margin: 1, width: 480 })
    : null;
  const itineraire = lienItineraire(r);
  // 1er passage pour mesurer la hauteur, puis le ticket a sa taille exacte.
  const hauteur = dessiner(new jsPDF({ unit: 'mm', format: [LARGEUR, 400] }), r, qr, itineraire);
  const doc = new jsPDF({ unit: 'mm', format: [LARGEUR, Math.ceil(hauteur)] });
  dessiner(doc, r, qr, itineraire);
  return doc;
}

/** App installee sur l'ecran d'accueil (sans barre d'adresse ni bouton retour). */
const appInstallee = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

/**
 * Telecharge le recu PDF sans quitter l'app. App installee sur telephone :
 * feuille de partage du systeme (Enregistrer, Imprimer, WhatsApp...) qui se
 * referme sur l'app ; sinon telechargement classique (la page ne change pas).
 */
export async function telechargerRecu(r) {
  const doc = await genererRecu(r);
  const nom = `recu-${r.reference}.pdf`;
  if (appInstallee()) {
    const fichier = new File([doc.output('blob')], nom, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [fichier] })) {
      try {
        await navigator.share({ files: [fichier], title: `Reçu ${r.reference}` });
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return; // partage ferme : on reste dans l'app
      }
    }
  }
  doc.save(nom);
}
