import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardApi } from '../api/api.js';
import LogoutButton from '../components/LogoutButton.jsx';

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

const OPCOES_STATUS = {
  EmAndamento: ['EmAndamento', 'Cancelada'],
  Finalizada: ['Finalizada', 'EmAtendimento', 'Atendida', 'Cancelada'],
  EmAtendimento: ['EmAtendimento', 'Finalizada', 'Atendida', 'Cancelada'],
  Atendida: ['Atendida', 'EmAtendimento', 'Finalizada', 'Cancelada'],
  Cancelada: ['Cancelada', 'Finalizada', 'EmAtendimento', 'Atendida']
};

function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  });
}

export default function TriagemDetalhes() {
  const { triagemId } = useParams();
  const navigate = useNavigate();
  const [triagem, setTriagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');
  const [erroStatus, setErroStatus] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }

    let ativo = true;
    DashboardApi.detalhes(triagemId)
      .then(({ data }) => {
        if (ativo) {
          setTriagem(data);
          setStatusSelecionado(data.status);
        }
      })
      .catch((e) => {
        if (!ativo) return;
        if (e.response?.status === 401) {
          sessionStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }
        setErro(e.response?.status === 404
          ? 'Esta triagem não foi encontrada.'
          : 'Não foi possível carregar os detalhes da triagem. Tente novamente.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => { ativo = false; };
  }, [triagemId, navigate]);

  async function salvarStatus() {
    if (!statusSelecionado || statusSelecionado === triagem?.status || salvandoStatus) return;
    setSalvandoStatus(true);
    setErroStatus('');
    setMensagemStatus('');
    try {
      const { data } = await DashboardApi.atualizarStatus(triagemId, statusSelecionado);
      setTriagem((atual) => ({ ...atual, status: data.status }));
      setStatusSelecionado(data.status);
      setMensagemStatus('Status atualizado.');
    } catch (e) {
      const statusHttp = e.response?.status;
      const resposta = e.response?.data;
      const detalhe = typeof resposta === 'string'
        ? resposta
        : resposta?.detail || resposta?.title || resposta?.message;

      if (statusHttp === 401) {
        sessionStorage.removeItem('token');
        navigate('/login', { replace: true });
      } else if (statusHttp === 403) {
        setErroStatus('Seu perfil não tem permissão para alterar o status.');
      } else if (detalhe) {
        setErroStatus(detalhe);
      } else if (statusHttp >= 500) {
        setErroStatus('A API não conseguiu gravar o status. Se escolheu "Em atendimento" ou "Atendida", aplique a migração 2026-11-27_status_atendimento.sql no banco de produção.');
      } else if (statusHttp) {
        setErroStatus(`A API recusou a alteração (HTTP ${statusHttp}). Confira o status atual da triagem e tente novamente.`);
      } else {
        setErroStatus('Não foi possível conectar à API. Verifique a conexão e tente novamente.');
      }
    } finally {
      setSalvandoStatus(false);
    }
  }

  return (
    <main className="dashboard-page">
      <header className="topbar dashboard-detail-topbar">
        <div>
          <h1>Detalhes da triagem</h1>
          <p>TriagemFácil — painel profissional</p>
        </div>
        <div className="dashboard-header-actions">
          <Link className="detail-back-link" to="/dashboard">Voltar ao painel</Link>
          <LogoutButton />
        </div>
      </header>

      {carregando && <div className="card detail-state">Carregando triagem...</div>}
      {!carregando && erro && <div className="card detail-state detail-error" role="alert">{erro}</div>}

      {!carregando && triagem && (
        <>
          <section className="detail-summary card" aria-label="Resumo da triagem">
            <div>
              <span className="detail-label">Paciente</span>
              <strong className="detail-patient-name">{triagem.pacienteNome}</strong>
              {triagem.pacienteIdade != null && <span>{triagem.pacienteIdade} anos</span>}
            </div>
            <div>
              <span className="detail-label">Classificação sugerida</span>
              {triagem.prioridade
                ? <span className={`badge ${triagem.prioridade}`}>{ROTULOS_PRIORIDADE[triagem.prioridade] ?? triagem.prioridade}</span>
                : <strong>Aguardando dados</strong>}
              {triagem.status === 'EmAndamento' && <small>Preliminar — validar com o profissional.</small>}
            </div>
            <div>
              <span className="detail-label">Status</span>
              <strong>{ROTULOS_STATUS[triagem.status] ?? triagem.status}</strong>
              <label className="detail-status-label" htmlFor="triagem-status">Alterar status</label>
              <select
                id="triagem-status"
                className="detail-status-select"
                value={statusSelecionado}
                onChange={(e) => { setStatusSelecionado(e.target.value); setMensagemStatus(''); setErroStatus(''); }}
              >
                {(OPCOES_STATUS[triagem.status] ?? [triagem.status]).map((status) => (
                  <option key={status} value={status}>{ROTULOS_STATUS[status] ?? status}</option>
                ))}
              </select>
              <button
                className="detail-status-save"
                type="button"
                onClick={salvarStatus}
                disabled={salvandoStatus || statusSelecionado === triagem.status}
              >
                {salvandoStatus ? 'Salvando...' : 'Salvar status'}
              </button>
              {mensagemStatus && <small className="status-feedback success" role="status">{mensagemStatus}</small>}
              {erroStatus && <small className="status-feedback error" role="alert">{erroStatus}</small>}
            </div>
            <div>
              <span className="detail-label">Iniciada em</span>
              <strong>{formatarData(triagem.dataHora)}</strong>
            </div>
          </section>

          <div className="detail-columns">
            <section className="card detail-section">
              <h2>Informações relatadas</h2>
              <p><strong>Sintoma principal:</strong> {triagem.principalSintoma || 'Ainda não informado'}</p>
              {triagem.observacoes && <p><strong>Observações:</strong> {triagem.observacoes}</p>}

              <h3>Sintomas registrados</h3>
              {triagem.sintomas?.length ? (
                <ul className="detail-symptoms">
                  {triagem.sintomas.map((sintoma, index) => (
                    <li key={`${sintoma.descricao}-${index}`}>
                      <strong>{sintoma.descricao}</strong>
                      <span>
                        {[
                          sintoma.intensidade != null && `Intensidade: ${sintoma.intensidade}/10`,
                          sintoma.duracao && `Duração: ${sintoma.duracao}`,
                          sintoma.discriminadorManchester && `Discriminador: ${sintoma.discriminadorManchester}`
                        ].filter(Boolean).join(' · ') || 'Sem detalhes adicionais'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-muted">Ainda não há sintomas estruturados nesta triagem.</p>
              )}
            </section>

            <section className="card detail-section">
              <h2>Conversa da triagem</h2>
              {triagem.mensagens?.length ? (
                <div className="detail-conversation">
                  {triagem.mensagens.map((mensagem, index) => (
                    <article
                      key={`${mensagem.timestamp}-${index}`}
                      className={`detail-message ${mensagem.origem === 'Paciente' ? 'from-patient' : ''}`}
                    >
                      <div>
                        <strong>{mensagem.origem === 'Paciente' ? 'Paciente' : mensagem.origem === 'Atendente' ? 'Atendente' : 'Assistente'}</strong>
                        <time>{formatarData(mensagem.timestamp)}</time>
                      </div>
                      <p>{mensagem.conteudo}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="detail-muted">A conversa ainda não tem mensagens.</p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
