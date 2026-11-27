import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PacienteApi } from '../api/api.js';

export default function Identificacao() {
  const [cpf, setCpf] = useState('');
  const [cns, setCns] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  async function continuar() {
    setErro(null);

    if (!cpf.trim() && !cns.trim()) {
      setErro('Informe o CPF ou o Cartão Nacional de Saúde (CNS).');
      return;
    }

    setCarregando(true);
    try {
      const { data } = await PacienteApi.identificar(cpf || null, cns || null);
      navigate(`/triagem/${data.triagemId}`, {
        state: { paciente: data.dados, mensagemInicial: data.mensagemInicial }
      });
    } catch (e) {
      setErro(
        e.response?.status === 404
          ? 'Não foi possível localizar seus dados. Peça ajuda a um atendente.'
          : 'Ocorreu um erro ao iniciar a triagem. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="app-container patient-start-page">
      <div className="topbar">
        <div>
          <h1>TriagemFácil</h1>
          <p>Sistema de Triagem Inteligente</p>
        </div>
        <a className="professional-access desktop-professional-access" href="/login">
          Acesso do profissional
        </a>
      </div>

      <div className="content">
        <h2 style={{ color: 'var(--azul-primario)' }}>Bem-vindo!</h2>
        <p style={{ fontSize: 14, color: '#546e7a' }}>
          Para iniciar sua triagem, informe seu CPF ou Cartão Nacional de Saúde (CNS).
        </p>

        <div className="card">
          <label>CPF</label>
          <input
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            maxLength={11}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
          />
          <small>Somente números</small>

          <div className="divider">ou</div>

          <label>Cartão Nacional de Saúde (CNS)</label>
          <input
            type="text"
            placeholder="000 0000 0000 0000"
            value={cns}
            maxLength={15}
            onChange={(e) => setCns(e.target.value.replace(/\D/g, ''))}
          />
          <small>15 dígitos, sem espaços</small>

          {erro && <p style={{ color: 'var(--vermelho)', fontSize: 13, marginTop: 10 }}>{erro}</p>}

          <button className="primary" onClick={continuar} disabled={carregando}>
            {carregando ? 'Consultando...' : 'Continuar'}
          </button>
        </div>

        <div className="help-box">
          <span>Precisa de ajuda? Chame um atendente — ele pode preencher por você.</span>
        </div>

        <p style={{ fontSize: 11, color: '#90a4ae', textAlign: 'center', marginTop: 24 }}>
          Seus dados são protegidos e utilizados apenas para fins de atendimento.
        </p>

        <p className="mobile-professional-access" style={{ textAlign: 'center', marginTop: 12 }}>
          <a href="/login" style={{ fontSize: 12, color: '#78909c' }}>Acesso do profissional de saúde</a>
        </p>
      </div>
    </div>
  );
}
