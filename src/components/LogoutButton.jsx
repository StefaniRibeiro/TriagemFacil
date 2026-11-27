import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  function sair() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nome');
    sessionStorage.removeItem('perfil');
    navigate('/login', { replace: true });
  }

  return (
    <button className="logout-button" type="button" onClick={sair}>
      Sair
    </button>
  );
}
