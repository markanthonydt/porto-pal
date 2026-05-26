import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FlashcardsPage from './pages/FlashcardsPage';
import MistakesPage from './pages/MistakesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="flashcards" element={<FlashcardsPage />} />
        <Route path="mistakes" element={<MistakesPage />} />
      </Route>
    </Routes>
  );
}
