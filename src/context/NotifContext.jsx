import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAnnoncesActives } from '../api/annonces';
import { ecouterChangements } from '../api/tempsReel';

// Annonces publiees par le gerant (chaines de slides photo ou video). Comme
// sur SenYummies : la popup s'ouvre toute seule a l'arrivee quand une chaine
// n'a pas encore ete vue sur cet appareil ; la cloche permet de la rouvrir.
const NotifContext = createContext(null);
const CLE_VUES = 'terrainapp_annonces_vues';

// Une chaine republiee (publishedAt modifie) redevient "nouvelle".
const cleChaine = (c) => `${c.id}@${c.publishedAt || c.updatedAt || ''}`;

function lireVues() {
  try {
    const vues = JSON.parse(localStorage.getItem(CLE_VUES));
    return Array.isArray(vues) ? vues : [];
  } catch {
    return [];
  }
}

export function NotifProvider({ children }) {
  const [chaines, setChaines] = useState([]);
  const [vues, setVues] = useState(lireVues);
  const [ouvert, setOuvert] = useState(false);
  const [autoOuvertureFaite, setAutoOuvertureFaite] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const charger = () => getAnnoncesActives().then(setChaines).catch(() => {});
    charger();
    // Temps reel : une annonce publiee, modifiee ou retiree apparait tout de suite.
    return ecouterChangements(['annonces'], charger);
  }, []);

  const nonVues = useMemo(() => chaines.filter((c) => !vues.includes(cleChaine(c))), [chaines, vues]);

  const marquerVues = useCallback(() => {
    const cles = chaines.map(cleChaine);
    setVues(cles);
    try {
      localStorage.setItem(CLE_VUES, JSON.stringify(cles));
    } catch {
      // non critique
    }
  }, [chaines]);

  const ouvrir = useCallback(() => setOuvert(true), []);
  const fermer = useCallback(() => {
    setOuvert(false);
    marquerVues();
  }, [marquerVues]);

  // Ouverture automatique : une fois l'ecran de demarrage parti (pret) et
  // les annonces chargees, une seule fois par visite.
  useEffect(() => {
    if (pret && !autoOuvertureFaite && nonVues.length > 0) {
      setOuvert(true);
      setAutoOuvertureFaite(true);
    }
  }, [pret, autoOuvertureFaite, nonVues.length]);

  const signalerPret = useCallback(() => setPret(true), []);

  const valeur = useMemo(
    () => ({ chaines, nbNouveautes: nonVues.length, ouvert, ouvrir, fermer, signalerPret }),
    [chaines, nonVues.length, ouvert, ouvrir, fermer, signalerPret],
  );

  return <NotifContext.Provider value={valeur}>{children}</NotifContext.Provider>;
}

export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif doit être utilisé dans NotifProvider');
  return ctx;
};
