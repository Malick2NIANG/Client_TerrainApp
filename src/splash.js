// Ecran de demarrage (splash) : fond pose par index.html des le premier
// octet, logo / nom / slogan ajoutes ici aux couleurs du complexe, puis
// retire en fondu une fois l'app affichee.
//
// L'animation ne se joue qu'au vrai lancement de l'app : premiere ouverture
// de la session, sur l'accueil. Jamais au retour du paiement, sur un lien
// partage (fiche terrain, reservation), apres un rechargement ou le bouton
// retour : l'ecran s'efface alors aussitot.
import { marque, nomEnDeuxTons } from './config/marque';

// Le temps que le nom finisse de s'eclaircir et que le slogan apparaisse.
const DUREE_MIN = 2700;
const CLE = 'terrainapp_splash_joue';
const debut = Date.now();
let sortie = null;

/** Faut-il jouer l'animation pour ce chargement de page ? */
export function lancementDeLApp({ chemin, typeNavigation, dejaJoue }) {
  if (dejaJoue) return false;
  if (typeNavigation === 'reload' || typeNavigation === 'back_forward') return false;
  return chemin === '/' || chemin === '';
}

function contexte(win = window) {
  let dejaJoue = false;
  try {
    dejaJoue = win.sessionStorage.getItem(CLE) === '1';
  } catch {
    dejaJoue = false;
  }
  const entree = win.performance?.getEntriesByType?.('navigation')?.[0];
  return { chemin: win.location.pathname, typeNavigation: entree?.type, dejaJoue };
}

const jouer = typeof window !== 'undefined' && lancementDeLApp(contexte());

function texte(balise, classe, contenu) {
  const el = document.createElement(balise);
  el.className = classe;
  el.textContent = contenu;
  return el;
}

/** Remplit l'ecran de demarrage (logo ou monogramme, nom en deux tons, slogan). */
export function remplirSplash(m = marque, doc = document) {
  const splash = doc.getElementById('splash');
  if (!splash) return;
  if (!jouer) {
    // Pas un lancement : ni logo ni nom, l'ecran part des que l'app est la.
    splash.classList.add('splash-rapide');
    return;
  }
  try {
    sessionStorage.setItem(CLE, '1');
  } catch {
    // navigation privee : sans consequence
  }
  const r = doc.documentElement.style;
  splash.style.setProperty('--splash-halo', `rgb(${r.getPropertyValue('--marque').trim().split(' ').join(',')})`);
  splash.style.setProperty('--splash-fond', `rgb(${r.getPropertyValue('--marque-nuit').trim().split(' ').join(',')})`);

  const bloc = doc.createElement('div');
  bloc.className = 'splash-bloc';
  if (m.logo) {
    const img = doc.createElement('img');
    img.src = m.logo;
    img.alt = '';
    img.className = 'splash-logo';
    bloc.appendChild(img);
  } else {
    bloc.appendChild(texte('span', 'splash-logo splash-monogramme', m.initiales));
  }
  const { debut: d, accent } = nomEnDeuxTons(m);
  const nom = texte('p', 'splash-nom', d);
  if (accent) nom.appendChild(texte('span', 'splash-accent', accent));
  bloc.appendChild(nom);
  bloc.appendChild(texte('p', 'splash-slogan', m.slogan));
  splash.appendChild(bloc);
}

/**
 * Retire l'ecran de demarrage, apres une duree minimale au premier
 * lancement. Promesse resolue une fois l'ecran parti (les annonces peuvent
 * alors s'ouvrir).
 */
export function masquerSplash(doc = document) {
  // Appele deux fois en developpement (React StrictMode) : une seule sortie.
  if (sortie) return sortie;
  const splash = doc.getElementById('splash');
  if (!splash) return Promise.resolve();
  const attente = jouer ? Math.max(0, DUREE_MIN - (Date.now() - debut)) : 0;
  sortie = new Promise((resolve) => {
    setTimeout(() => {
      splash.classList.add('splash-sortie');
      setTimeout(() => {
        splash.remove();
        resolve();
      }, jouer ? 900 : 250);
    }, attente);
  });
  return sortie;
}
