import { Navigate, Route, Routes } from 'react-router-dom';

import { LayerControlPage } from './pages/LayerControlPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LayerControlPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
