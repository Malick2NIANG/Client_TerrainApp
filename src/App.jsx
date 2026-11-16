import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext';
import { MesReservationsProvider } from './context/MesReservationsContext';
import { NotifProvider, useNotif } from './context/NotifContext';
import Accueil from './pages/Accueil';
import NosTerrains from './pages/NosTerrains';
import Terrain from './pages/Terrain';
import Reserver from './pages/Reserver';
import Reservation from './pages/Reservation';
import MesReservations from './pages/MesReservations';

// Premier rendu fait : l'ecran de demarrage part, puis les annonces
// non vues s'ouvrent.
function Demarrage({ onPret }) {
  const { signalerPret } = useNotif();
  useEffect(() => {
    Promise.resolve(onPret?.()).then(signalerPret);
  }, [onPret, signalerPret]);
  return null;
}

export default function App({ onPret }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <NotifProvider>
        <Demarrage onPret={onPret} />
        <MesReservationsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Accueil />} />
              <Route path="/terrains" element={<NosTerrains />} />
              <Route path="/terrains/:id" element={<Terrain />} />
              <Route path="/reserver" element={<Reserver />} />
              <Route path="/reservations/:id" element={<Reservation />} />
              <Route path="/mes-reservations" element={<MesReservations />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MesReservationsProvider>
        </NotifProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
