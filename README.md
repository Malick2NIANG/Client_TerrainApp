# Client_TerrainApp

PWA des joueurs de **TerrainApp** : choisir un terrain, un créneau, payer
(Wave, Orange Money, Mixx by Yas, carte) et recevoir son ticket QR, **sans compte**.
Marque blanche : nom, logo, couleurs, slogan et adresse du complexe viennent de
la configuration (`VITE_MARQUE_*` en dev, `MARQUE_*` en Docker), jamais du code.

## Lancer en local

Il faut aussi le backend démarré. Pour lancer les trois applications ensemble et faire le vrai parcours, suivre le guide [`LANCER-EN-LOCAL.md`](https://github.com/Malick2NIANG/Backend_TerrainApp/blob/main/LANCER-EN-LOCAL.md) du dépôt Backend.

```bash
cp .env.example .env     # VITE_API_BASE_URL=/api/v1
npm install
npm run dev              # http://localhost:5180
```

Le backend (`Backend_TerrainApp`) doit tourner (`docker compose up`, port 8090) :
le serveur Vite lui relaie `/api/v1`.

## Écrans

| Route | Rôle |
|---|---|
| `/` | terrains du complexe, filtre par sport |
| `/terrains/:id` | fiche, choix du jour et du créneau (mis à jour en temps réel) |
| `/reserver` | nom, téléphone, moyen de paiement |
| `/reservations/:id` | suivi et ticket QR (sur le téléphone qui a réservé) |
| `/mes-reservations` | réservations de ce téléphone + recherche par numéro |

## Contrôles

```bash
npm run lint && npm test && npm run build
```
