import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext';
import { MesReservationsProvider } from './context/MesReservationsContext';
import Accueil from './pages/Accueil';
import Terrain from './pages/Terrain';
import Reserver from './pages/Reserver';
import Reservation from './pages/Reservation';
import MesReservations from './pages/MesReservations';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <MesReservationsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Accueil />} />
              <Route path="/terrains/:id" element={<Terrain />} />
              <Route path="/reserver" element={<Reserver />} />
              <Route path="/reservations/:id" element={<Reservation />} />
              <Route path="/mes-reservations" element={<MesReservations />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </MesReservationsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
