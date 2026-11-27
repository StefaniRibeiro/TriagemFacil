import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardApi } from '../api/api.js';

const ROTULOS_PRIORIDADE = {
  Emergente: 'Vermelho — Emergente',
  MuitoUrgente: 'Laranja — Muito urgente',
  Urgente: 'Amarelo — Urgente',
  PoucoUrgente: 'Verde — Pouco urgente',
  NaoUrgente: 'Azul — Não urgente'
};

const ROTULOS_STATUS = {
  EmAndamento: 'Em triagem',
  Finalizada: 'Finalizada',
  Cancelada: 'Cancelada'
};

function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

export default function TriagemDetalhes() {
  const { triagemId } = useParams();
  const navigate = useNavigate();
  const [triagem, setTriagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }

    let ativo = true;
    DashboardApi.detalhes(triagemId)
      .then(({ data }) => {
        if (ativo) setTriagem(data);
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

  return (
    <main className="dashboard-page">
      <header className="topbar dashboard-detail-topbar">
        <div>
          <h1>Detalhes da triagem</h1>
          <p>TriagemFácil — painel profissional</p>
        </div>
        <Link className="detail-back-link" to="/dashboard">Voltar ao painel</Link>
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
