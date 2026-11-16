import client from './client';

// Annonces publiees par le gerant (Manager, page Annonces) : des chaines de
// slides { titre, message, mediaUrl, mediaType: IMAGE | VIDEO }. Toutes les
// chaines publiees a la suite, la DERNIERE publiee en premier.
export const getAnnoncesActives = () =>
  client.get('/annonces', { params: { statut: 'ACTIF' } }).then((r) =>
    (Array.isArray(r.data) ? r.data : [])
      .filter((c) => c.statut === 'ACTIF' && Array.isArray(c.slides) && c.slides.length > 0)
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
  );
