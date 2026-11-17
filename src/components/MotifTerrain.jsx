/** Lignes d'un terrain (decor du bandeau d'accueil), a la craie. */
export default function MotifTerrain({ className = '' }) {
  return (
    <svg viewBox="0 0 600 400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}
      preserveAspectRatio="xMidYMid slice">
      <rect x="20" y="20" width="560" height="360" rx="6" />
      <line x1="300" y1="20" x2="300" y2="380" />
      <circle cx="300" cy="200" r="62" />
      <circle cx="300" cy="200" r="4" fill="currentColor" />
      <rect x="20" y="110" width="90" height="180" />
      <rect x="20" y="160" width="34" height="80" />
      <rect x="490" y="110" width="90" height="180" />
      <rect x="546" y="160" width="34" height="80" />
      <path d="M110 160a46 46 0 0 1 0 80M490 160a46 46 0 0 0 0 80" />
    </svg>
  );
}
