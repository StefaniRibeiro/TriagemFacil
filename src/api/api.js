// src/api/api.js — camada de comunicação com o back-end (SistemaTriagem.Api)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Anexa o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────────────────────────
// Autenticação — POST /api/auth/login
// Retorno: { token, nome, perfil }
// ─────────────────────────────────────────────────────────────
export const AuthApi = {
  login: (login, senha) =>
    api.post('/auth/login', { login, senha }),
};

// ─────────────────────────────────────────────────────────────
// Paciente — POST /api/paciente/identificar
// Retorno: { pacienteId, triagemId, dados: { nome, cpf, cns, ... } }
// ─────────────────────────────────────────────────────────────
export const PacienteApi = {
  identificar: (cpf, cns) =>
    api.post('/paciente/identificar', { cpf: cpf || null, cns: cns || null }),
};

// ─────────────────────────────────────────────────────────────
// Chatbot
//   POST /api/chatbot/mensagem         → envia mensagem do paciente
//   GET  /api/chatbot/{triagemId}/historico → busca histórico
//
// Retorno enviarMensagem: { respostaChatbot, mensagemPacienteId, mensagemChatbotId }
// Retorno historico: [ { origem, conteudo, timestamp }, ... ]
// ─────────────────────────────────────────────────────────────
export const ChatbotApi = {
  enviarMensagem: (triagemId, conteudo) =>
    api.post('/chatbot/mensagem', { triagemId, conteudo }),

  historico: (triagemId) =>
    api.get(`/chatbot/${triagemId}/historico`),
};

// ─────────────────────────────────────────────────────────────
// Triagem — POST /api/triagem/finalizar
// Retorno: { triagemId, prioridadeSugerida, fluxoAutomacaoDisparado }
// ─────────────────────────────────────────────────────────────
export const TriagemApi = {
  finalizar: (triagemId, sintomas, observacoes) =>
    api.post('/triagem/finalizar', {
      triagemId,
      sintomas,
      observacoes: observacoes || null,
    }),
};

// ─────────────────────────────────────────────────────────────
// Dashboard (rotas protegidas — requer perfil ProfissionalSaude ou Admin)
//   GET /api/dashboard/resumo          → { triagensHoje, aguardando, urgentes, atendidas }
//   GET /api/dashboard/triagens        → lista de triagens (filtro opcional: ?prioridade=Urgente)
//   GET /api/dashboard/triagens/{id}   → detalhes de uma triagem
// ─────────────────────────────────────────────────────────────
export const DashboardApi = {
  resumo: () =>
    api.get('/dashboard/resumo'),

  listarTriagens: (prioridade) =>
    api.get('/dashboard/triagens', {
      params: prioridade ? { prioridade } : {},
    }),

  detalhes: (id) =>
    api.get(`/dashboard/triagens/${id}`),

  atualizarStatus: (id, status) =>
    api.patch(`/dashboard/triagens/${id}/status`, { status }),
};

export default api;
