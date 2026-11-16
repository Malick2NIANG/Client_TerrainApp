// Ecran de demarrage (splash) : fond pose par index.html des le premier
// octet, logo / nom / slogan ajoutes ici aux couleurs du complexe, puis
// retire en fondu une fois l'app affichee.
//
// Animation complete au premier lancement de la session (ouverture de
// l'app installee, premiere visite) ; apres, un simple fondu.
import { marque, nomEnDeuxTons } from './config/marque';

const CLE = 'terrainapp_splash_vu';
// Le temps que le nom finisse de s'eclaircir et que le slogan apparaisse.
const DUREE_MIN = 2700;
const debut = Date.now();
let sortie = null;

function dejaVu() {
  try {
    return sessionStorage.getItem(CLE) === '1';
  } catch {
    return false;
  }
}

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
  const r = doc.documentElement.style;
  splash.style.setProperty('--splash-halo', `rgb(${r.getPropertyValue('--marque').trim().split(' ').join(',')})`);
  splash.style.setProperty('--splash-fond', `rgb(${r.getPropertyValue('--marque-nuit').trim().split(' ').join(',')})`);

  const bloc = doc.createElement('div');
  bloc.className = `splash-bloc${dejaVu() ? ' splash-calme' : ''}`;
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
  const attente = dejaVu() ? 0 : Math.max(0, DUREE_MIN - (Date.now() - debut));
  try {
    sessionStorage.setItem(CLE, '1');
  } catch {
    // Navigation privee : l'animation sera simplement rejouee.
  }
  sortie = new Promise((resolve) => {
    setTimeout(() => {
      splash.classList.add('splash-sortie');
      setTimeout(() => {
        splash.remove();
        resolve();
      }, 900);
    }, attente);
  });
  return sortie;
}
