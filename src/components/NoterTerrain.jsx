import { useState } from 'react';
import { deposerAvis } from '../api/avis';
import { ChoixEtoiles, Etoiles } from './Etoiles';
import { LIBELLES_NOTE } from '../utils/avis';

// Apres le match : le joueur note le terrain (1 a 5) et peut laisser un
// mot. Un avis par reservation ; prenom et initiale seulement affiches.
export default function NoterTerrain({ reservation, jeton, onNote }) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  if (reservation.avisNote) {
    return (
      <section className="rounded-xl border border-line p-5 text-center">
        <p className="font-semibold">Merci pour votre avis !</p>
        <Etoiles note={reservation.avisNote} taille={22} className="mt-2 justify-center" />
        <p className="mt-1 text-sm text-ink-light">{LIBELLES_NOTE[reservation.avisNote]}</p>
      </section>
    );
  }

  const envoyer = async (e) => {
    e.preventDefault();
    if (!note) {
      setErreur('Choisissez une note de 1 à 5 étoiles.');
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      await deposerAvis(reservation.id, jeton, note, commentaire);
      onNote(note);
    } catch (err) {
      setErreur(err.message);
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={envoyer} className="rounded-xl border border-line p-5">
      <h2 className="font-bold">Comment s’est passé votre match ?</h2>
      <p className="mt-0.5 text-sm text-ink-light">Notez {reservation.terrain} : votre avis aide les autres joueurs.</p>
      <div className="mt-3"><ChoixEtoiles valeur={note} onChange={setNote} /></div>
      <label className="mt-2 block text-sm">
        <span className="font-semibold">Un mot (facultatif)</span>
        <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} maxLength={500} rows={3}
          placeholder="Gazon, éclairage, vestiaires, accueil…"
          className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:border-primary" />
      </label>
      {erreur && <p role="alert" className="mt-2 text-sm text-danger">{erreur}</p>}
      <button type="submit" disabled={envoi}
        className="mt-3 h-12 w-full rounded-xl bg-primary text-[15px] font-semibold text-white disabled:opacity-60">
        {envoi ? 'Envoi…' : 'Publier mon avis'}
      </button>
    </form>
  );
}
