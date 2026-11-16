import { BASE_URL } from './client';

// Flux public du serveur (SSE) : un message "changement" {sujet} quand les
// terrains ou les disponibilites changent. Une seule connexion partagee ;
// chaque ecran recharge seulement ce qui le concerne.
const abonnes = new Set();
let source = null;

function ouvrir() {
  if (source || typeof EventSource === 'undefined' || !BASE_URL.startsWith('/') && !BASE_URL.startsWith('http')) return;
  source = new EventSource(`${BASE_URL}/temps-reel/public`);
  source.addEventListener('changement', (e) => {
    let sujet = null;
    try {
      sujet = JSON.parse(e.data).sujet;
    } catch {
      return;
    }
    abonnes.forEach((a) => {
      if (!a.sujets || a.sujets.includes(sujet)) a.rappel(sujet);
    });
  });
}

/** @returns fonction de desabonnement */
export function ecouterChangements(sujets, rappel) {
  const a = { sujets, rappel };
  abonnes.add(a);
  ouvrir();
  return () => {
    abonnes.delete(a);
    if (abonnes.size === 0 && source) {
      source.close();
      source = null;
    }
  };
}
