import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api/api.js';

export default function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function entrar() {
    setErro(null);
    setCarregando(true);
    try {
      const { data } = await AuthApi.login(login, senha);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('nome', data.nome);
      sessionStorage.setItem('perfil', data.perfil);
      navigate('/dashboard');
    } catch {
      setErro('Usuário ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="app-container professional-login-page">
      <div className="topbar">
        <div>
          <h1>TriagemFácil</h1>
          <p>Área profissional</p>
        </div>
        <a className="login-home-link" href="/">Voltar ao início</a>
      </div>
      <div className="content">
        <section className="card professional-login-card" aria-labelledby="login-title">
          <div className="login-intro">
            <span className="login-eyebrow">ACESSO DA EQUIPE DE SAÚDE</span>
            <h2 id="login-title">Bem-vindo(a)!</h2>
            <p>Entre com suas credenciais para acompanhar as triagens.</p>
          </div>

          <form className="professional-login-form" onSubmit={(e) => { e.preventDefault(); entrar(); }}>
            <label htmlFor="professional-login">Usuário</label>
            <input
              id="professional-login"
              type="text"
              autoComplete="username"
              placeholder="Digite seu usuário"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />

            <label htmlFor="professional-password">Senha</label>
            <input
              id="professional-password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            {erro && <p className="login-error" role="alert">{erro}</p>}
            <button className="primary" type="submit" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
