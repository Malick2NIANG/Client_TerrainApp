// Recherche de terrains, cote navigateur (un complexe = quelques terrains) :
// insensible aux accents et a la casse, chaque mot doit apparaitre dans le
// nom, le sport, la localite, la surface, la description ou les equipements.

/** "Liberté 6" -> "liberte 6". */
export function normaliser(texte) {
  return String(texte || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function botte(t) {
  return normaliser([t.nom, t.sport, t.localite, t.surface, t.description, ...(t.equipements || [])].join(' '));
}

/** Terrains qui correspondent a la saisie (tous si elle est vide). */
export function filtrerTerrains(terrains, saisie, sportId = null) {
  const mots = normaliser(saisie).split(/\s+/).filter(Boolean);
  return (terrains || []).filter((t) => {
    if (sportId !== null && t.sportId !== sportId) return false;
    if (!mots.length) return true;
    const texte = botte(t);
    return mots.every((m) => texte.includes(m));
  });
}

/** Localites distinctes (suggestions de recherche), dans l'ordre d'apparition. */
export function localites(terrains) {
  return [...new Set((terrains || []).map((t) => t.localite).filter(Boolean))];
}

/** Photos d'un terrain : la galerie, sinon la couverture seule. */
export function photosDe(t) {
  if (t?.photos?.length) return t.photos;
  return t?.photoUrl ? [t.photoUrl] : [];
}

/** Tarif le plus bas du terrain (base ou plage), pour "des X / h". */
export function tarifMin(t) {
  return Math.min(t.tarifHeure, ...(t.plages || []).map((p) => p.tarifHeure));
}

/** Media video (galerie d'un terrain, annonces) : reconnu a son extension. */
export function estVideo(url) {
  return /\.(mp4|webm)(?:[?#].*)?$/i.test(String(url || ''));
}

/** "3 photos", ou "3 médias" des qu'il y a une video. */
export function libelleMedias(medias) {
  const n = medias.length;
  const mot = medias.some(estVideo) ? 'média' : 'photo';
  return `${n} ${mot}${n > 1 ? 's' : ''}`;
}
