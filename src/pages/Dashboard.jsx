import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardApi } from '../api/api.js';
import LogoutButton from '../components/LogoutButton.jsx';

const FILTROS = [
  { chave: null, label: 'Todos' },
  { chave: 'Emergente', label: 'Emergência' },
  { chave: 'MuitoUrgente', label: 'Muito urgente' },
  { chave: 'Urgente', label: 'Urgente' },
  { chave: 'PoucoUrgente', label: 'Moderado' },
  { chave: 'NaoUrgente', label: 'Pouco urgente' }
];

const ROTULOS_PRIORIDADE = {
  Emergente: 'Vermelho — Emergência',
  MuitoUrgente: 'Laranja — Muito urgente',
  Urgente: 'Amarelo — Urgente',
  PoucoUrgente: 'Verde — Pouco urgente',
  NaoUrgente: 'Azul — Não urgente'
};

const ROTULOS_STATUS = {
  EmAndamento: 'Em triagem',
  Finalizada: 'Aguardando atendimento',
  EmAtendimento: 'Em atendimento',
  Atendida: 'Atendida',
  Cancelada: 'Cancelada'
};

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [triagens, setTriagens] = useState([]);
  const [filtro, setFiltro] = useState(null);
  const [busca, setBusca] = useState('');
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [erroAtualizacao, setErroAtualizacao] = useState('');
  const requisicaoEmAndamento = useRef(false);
  const navigate = useNavigate();

  const carregarDados = useCallback(async () => {
    if (requisicaoEmAndamento.current) return;
    requisicaoEmAndamento.current = true;
    setAtualizando(true);

    try {
      const [resumoResponse, triagensResponse] = await Promise.all([
        DashboardApi.resumo(),
        DashboardApi.listarTriagens(filtro)
      ]);
      setResumo(resumoResponse.data);
      setTriagens(triagensResponse.data);
      setAtualizadoEm(new Date());
      setErroAtualizacao('');
    } catch {
      setErroAtualizacao('Não foi possível atualizar agora. Tentaremos novamente.');
    } finally {
      requisicaoEmAndamento.current = false;
      setAtualizando(false);
    }
  }, [filtro]);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    carregarDados();
    const atualizacao = window.setInterval(carregarDados, 5000);
    const atualizarAoVoltar = () => {
      if (document.visibilityState === 'visible') carregarDados();
    };
    window.addEventListener('focus', atualizarAoVoltar);
    document.addEventListener('visibilitychange', atualizarAoVoltar);

    return () => {
      window.clearInterval(atualizacao);
      window.removeEventListener('focus', atualizarAoVoltar);
      document.removeEventListener('visibilitychange', atualizarAoVoltar);
    };
  }, [navigate, carregarDados]);

  const triagensFiltradas = triagens.filter((t) =>
    t.pacienteNome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <main className="dashboard-page">
      <div className="topbar">
        <div>
          <h1>TriagemFácil</h1>
          <p>Sistema de Triagem Inteligente</p>
        </div>
        <div className="dashboard-header-actions">
          <span className="dashboard-user">
            {sessionStorage.getItem('nome')} — {sessionStorage.getItem('perfil')}
          </span>
          <LogoutButton />
        </div>
      </div>

      <div className="dashboard-live-status">
        <span role="status">
          {erroAtualizacao || (atualizadoEm
            ? `Atualizado às ${atualizadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Carregando dados...')}
        </span>
        <button className="dashboard-refresh-button" type="button" onClick={carregarDados} disabled={atualizando}>
          {atualizando ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {resumo && (
        <div className="kpi-row">
          <div className="kpi"><div className="valor">{resumo.triagensHoje}</div><div className="label">Triagem hoje</div></div>
          <div className="kpi"><div className="valor">{resumo.aguardando}</div><div className="label">Aguardando atendimento</div></div>
          <div className="kpi"><div className="valor">{resumo.urgentes}</div><div className="label">Urgentes</div></div>
          <div className="kpi"><div className="valor">{resumo.atendidas}</div><div className="label">Atendidas</div></div>
        </div>
      )}

      <div className="card">
        <div className="dashboard-toolbar">
          <div className="dashboard-filter-list">
            {FILTROS.map((f) => (
              <button
                key={f.label}
                className={`filtro-btn ${filtro === f.chave ? 'ativo' : ''}`}
                onClick={() => setFiltro(f.chave)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="dashboard-search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="dashboard-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Horário</th>
              <th>Sintoma principal</th>
              <th>Classificação sugerida</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {triagensFiltradas.map((t) => (
              <tr key={t.id}>
                <td data-label="Paciente">
                  <strong>{t.pacienteNome}</strong>
                  <br /><small>{t.pacienteIdade ? `${t.pacienteIdade} anos` : ''}</small>
                </td>
                <td data-label="Horário">{new Date(t.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</td>
                <td data-label="Sintoma">{t.principalSintoma ?? '—'}</td>
                <td data-label="Classificação sugerida">
                  {t.prioridade ? <>
                    <span className={`badge ${t.prioridade}`}>{ROTULOS_PRIORIDADE[t.prioridade] ?? t.prioridade}</span>
                    {t.status === 'EmAndamento' && <><br /><small>Preliminar — validar</small></>}
                  </> : 'Aguardando dados'}
                </td>
                <td data-label="Status">{ROTULOS_STATUS[t.status] ?? t.status}</td>
                <td data-label="Ação">
                  <button
                    className="filtro-btn"
                    onClick={() => navigate(`/dashboard/triagens/${t.id}`)}
                    aria-label={`Ver detalhes da triagem ${t.id}`}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {triagensFiltradas.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#90a4ae' }}>Nenhuma triagem encontrada.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </main>
  );
}
