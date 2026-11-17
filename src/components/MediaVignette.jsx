import { Play } from 'lucide-react';
import { estVideo } from '../utils/recherche';
import { positionCadrage } from '../utils/cadrage';

// Apercu d'un media de galerie : photo, ou premiere image d'une video avec
// un bouton lecture (la video se lit en plein ecran, dans la visionneuse).
export default function MediaVignette({ url, alt = '', className = '', eager = false }) {
  if (!estVideo(url)) {
    return <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'} draggable="false" className={className}
      style={{ objectPosition: positionCadrage(url) }} />;
  }
  return (
    <span className={`relative block ${className}`}>
      <video src={`${url}#t=0.1`} muted playsInline preload="metadata" aria-label={alt || 'Vidéo'}
        className="h-full w-full object-cover" />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
          <Play size={22} fill="currentColor" aria-hidden="true" />
        </span>
      </span>
    </span>
  );
}
