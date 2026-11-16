import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Reservations faites depuis ce telephone : le jeton de suivi (remis une
// seule fois par le serveur) donne acces au detail et au ticket. Sans
// compte : il n'existe que sur cet appareil.
const CLE = 'terrainapp_reservations_v1';
const MAX = 50;

function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || '[]');
    return Array.isArray(v) ? v.filter((r) => r && r.id && r.jeton) : [];
  } catch {
    return [];
  }
}

function ecrire(liste) {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {
    // stockage plein ou interdit : la reservation reste valable cote serveur
  }
}

const Ctx = createContext(null);

export function MesReservationsProvider({ children }) {
  const [liste, setListe] = useState(lire);

  const ajouter = useCallback((r) => {
    setListe((avant) => {
      const suivante = [r, ...avant.filter((x) => x.id !== r.id)].slice(0, MAX);
      ecrire(suivante);
      return suivante;
    });
  }, []);

  const jetonDe = useCallback((id) => liste.find((r) => String(r.id) === String(id))?.jeton || null, [liste]);

  const valeur = useMemo(() => ({ liste, ajouter, jetonDe }), [liste, ajouter, jetonDe]);
  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useMesReservations() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMesReservations hors de MesReservationsProvider');
  return v;
}
