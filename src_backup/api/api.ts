import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Anexa o token JWT (armazenado após login) nas requisições ao painel administrativo.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const PacienteApi = {
  identificar: (cpf, cns) => api.post('/paciente/identificar', { cpf, cns })
};

export const ChatbotApi = {
  enviarMensagem: (triagemId, conteudo) => api.post('/chatbot/mensagem', { triagemId, conteudo }),
  historico: (triagemId) => api.get(`/chatbot/${triagemId}/historico`)
};

export const TriagemApi = {
  finalizar: (triagemId, sintomas, observacoes) =>
    api.post('/triagem/finalizar', { triagemId, sintomas, observacoes })
};

export const DashboardApi = {
  resumo: () => api.get('/dashboard/resumo'),
  listarTriagens: (prioridade) => api.get('/dashboard/triagens', { params: { prioridade } }),
  detalhes: (id) => api.get(`/dashboard/triagens/${id}`)
};

export const AuthApi = {
  login: (login, senha) => api.post('/auth/login', { login, senha })
};

export default api;
