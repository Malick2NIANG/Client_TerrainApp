import { describe, expect, it } from 'vitest';
import { filtrerTerrains, localites, normaliser, photosDe, tarifMin } from './recherche';

const terrains = [
  { id: 1, sportId: 1, nom: 'Terrain A', sport: 'Football 5', localite: 'Liberté 6, Dakar', surface: 'Gazon synthétique', equipements: ['Éclairage', 'Douches'] },
  { id: 2, sportId: 2, nom: 'Grand terrain', sport: 'Football 7', localite: 'Mermoz, Dakar', surface: 'Gazon', equipements: ['Tribune'] },
  { id: 3, sportId: 3, nom: 'Padel 1', sport: 'Padel', localite: 'Liberté 6, Dakar', equipements: [] },
];

describe('recherche de terrains', () => {
  it('ignore accents et majuscules', () => {
    expect(normaliser('  LIBERTÉ 6 ')).toBe('liberte 6');
  });

  it('cherche dans le nom, la localite, le sport et les equipements', () => {
    expect(filtrerTerrains(terrains, 'liberte').map((t) => t.id)).toEqual([1, 3]);
    expect(filtrerTerrains(terrains, 'mermoz').map((t) => t.id)).toEqual([2]);
    expect(filtrerTerrains(terrains, 'padel').map((t) => t.id)).toEqual([3]);
    expect(filtrerTerrains(terrains, 'douche').map((t) => t.id)).toEqual([1]);
    expect(filtrerTerrains(terrains, 'foot liberte').map((t) => t.id)).toEqual([1]);
    expect(filtrerTerrains(terrains, 'basket')).toEqual([]);
  });

  it('combine recherche et sport', () => {
    expect(filtrerTerrains(terrains, '', 2).map((t) => t.id)).toEqual([2]);
    expect(filtrerTerrains(terrains, 'liberte', 3).map((t) => t.id)).toEqual([3]);
    expect(filtrerTerrains(terrains, '  ')).toHaveLength(3);
  });

  it('liste les localites sans doublon', () => {
    expect(localites(terrains)).toEqual(['Liberté 6, Dakar', 'Mermoz, Dakar']);
  });

  it('photos : galerie, sinon couverture', () => {
    expect(photosDe({ photos: ['/a.jpg', '/b.jpg'], photoUrl: '/a.jpg' })).toEqual(['/a.jpg', '/b.jpg']);
    expect(photosDe({ photos: [], photoUrl: '/a.jpg' })).toEqual(['/a.jpg']);
    expect(photosDe({})).toEqual([]);
  });

  it('tarif le plus bas', () => {
    expect(tarifMin({ tarifHeure: 15000, plages: [{ tarifHeure: 20000 }, { tarifHeure: 12000 }] })).toBe(12000);
    expect(tarifMin({ tarifHeure: 15000 })).toBe(15000);
  });
});

describe('medias', async () => {
  const { estVideo, libelleMedias } = await import('./recherche');
  it('reconnait les videos et nomme la galerie', () => {
    expect(estVideo('/videos/demo/presentation.mp4')).toBe(true);
    expect(estVideo('/api/v1/videos/a.webm')).toBe(true);
    expect(estVideo('/images/demo/foot.jpg')).toBe(false);
    expect(libelleMedias(['/a.jpg', '/b.jpg'])).toBe('2 photos');
    expect(libelleMedias(['/a.jpg', '/b.mp4'])).toBe('2 médias');
    expect(libelleMedias(['/a.jpg'])).toBe('1 photo');
  });
});
