import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Identificacao from './pages/Identificacao.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela 1: identificação do paciente (fluxo do paciente/atendente) */}
        <Route path="/" element={<Identificacao />} />

        {/* Tela 2: interação com o chatbot de triagem */}
        <Route path="/triagem/:triagemId" element={<Chatbot />} />

        {/* Login do profissional de saúde */}
        <Route path="/login" element={<Login />} />

        {/* Tela 3: painel administrativo do profissional de saúde */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
