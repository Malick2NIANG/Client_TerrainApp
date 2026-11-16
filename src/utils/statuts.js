// Libelles et couleurs des statuts de reservation (memes codes que l'API).
export const STATUTS = {
  EN_ATTENTE_PAIEMENT: { libelle: 'En attente de paiement', classe: 'bg-amber-100 text-amber-800' },
  CONFIRMEE: { libelle: 'Confirmée', classe: 'bg-success/10 text-success' },
  HONOREE: { libelle: 'Jouée', classe: 'bg-ink/10 text-ink' },
  ANNULEE: { libelle: 'Annulée', classe: 'bg-danger/10 text-danger' },
  EXPIREE: { libelle: 'Expirée', classe: 'bg-ink/10 text-ink-light' },
};

export const statut = (code) => STATUTS[code] || { libelle: code, classe: 'bg-ink/10 text-ink' };
