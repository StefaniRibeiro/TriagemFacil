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
      <div className="topbar"><h1>TriagemFácil — Acesso Profissional</h1></div>
      <div className="content">
        <div className="card">
          <label>Usuário</label>
          <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
          <label style={{ marginTop: 12, display: 'block' }}>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && entrar()} />
          {erro && <p style={{ color: 'var(--vermelho)', fontSize: 13, marginTop: 10 }}>{erro}</p>}
          <button className="primary" onClick={entrar} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
