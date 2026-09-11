// src/api/api.js – mocked API layer for development without a backend
import axios from 'axios';

// Keep the axios instance for possible real calls later (e.g., when the backend is ready)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token if present – still useful for auth‑protected routes when backend exists
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to quickly create a mock response
function mockResponse(data) {
  return Promise.resolve({ data });
}

export const PacienteApi = {
  // Mock: always return a successful identification with dummy patient info
  identificar: (cpf, cns) =>
    mockResponse({
      paciente: {
        nome: 'João da Silva',
        idade: 35,
        cpf,
        cns,
        risco: 'baixo',
      },
      mensagem: 'Identificação simulada com sucesso',
    }),
};

export const ChatbotApi = {
  // Mock chat flow – echo the sent content and generate a fake reply
  enviarMensagem: (triagemId, conteudo) =>
    mockResponse({
      triagemId,
      mensagem: `Eco da mensagem: ${conteudo}`,
      resposta: 'Esta é uma resposta simulada do chatbot.',
    }),
  historico: (triagemId) =>
    mockResponse({
      triagemId,
      historico: [
        { autor: 'paciente', texto: 'Olá' },
        { autor: 'bot', texto: 'Como posso ajudar?' },
      ],
    }),
};

export const TriagemApi = {
  // Mock finalização – simply acknowledge the data
  finalizar: (triagemId, sintomas, observacoes) =>
    mockResponse({
      triagemId,
      status: 'finalizada',
      sintomas,
      observacoes,
    }),
};

export const DashboardApi = {
  resumo: () =>
    mockResponse({
      totalTriagens: 12,
      pendentes: 3,
      emAtendimento: 4,
      finalizadas: 5,
    }),
  listarTriagens: (prioridade) =>
    mockResponse({
      prioridade,
      triagens: [
        { id: 't1', paciente: 'Ana', prioridade: 'alta' },
        { id: 't2', paciente: 'Carlos', prioridade: 'media' },
      ],
    }),
  detalhes: (id) =>
    mockResponse({
      id,
      paciente: 'Ana',
      sintomas: ['febre', 'tosse'],
      prioridade: 'alta',
      status: 'em andamento',
    }),
};

export const AuthApi = {
  // Mock login – returns a dummy JWT token
  login: (login, senha) =>
    mockResponse({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.payload.signature',
      usuario: { login, nome: 'Profissional de Saúde' },
    }),
};

export default api;
