import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChatbotApi, TriagemApi } from '../api/api.js';

const MENSAGEM_FINAL = 'Sua triagem foi concluída. Aguarde chamar pelo seu nome';

export default function Chatbot() {
  const { triagemId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [triagemConcluida, setTriagemConcluida] = useState(false);
  const fimRef = useRef(null);

  const paciente = state?.paciente;

  useEffect(() => {
    ChatbotApi.historico(triagemId).then(({ data }) => {
      setMensagens(data);
      setTriagemConcluida(data.some((m) => m.origem === 'Chatbot' && m.conteudo === MENSAGEM_FINAL));
    });
  }, [triagemId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  async function enviar(conteudo) {
    if (!conteudo.trim() || enviando || triagemConcluida) return;
    setEnviando(true);
    setTexto('');

    setMensagens((prev) => [...prev, { origem: 'Paciente', conteudo, timestamp: new Date() }]);

    try {
      const { data } = await ChatbotApi.enviarMensagem(triagemId, conteudo);
      setMensagens((prev) => [
        ...prev,
        { origem: 'Chatbot', conteudo: data.respostaChatbot, timestamp: new Date() }
      ]);
    } catch {
      setMensagens((prev) => [
        ...prev,
        { origem: 'Chatbot', conteudo: 'Desculpe, houve um problema. Um atendente pode te ajudar.', timestamp: new Date() }
      ]);
    } finally {
      setEnviando(false);
    }
  }

  // Extrai uma lista simplificada de "sintomas" a partir das mensagens do paciente
  // para envio ao endpoint de finalização (RF07). Em produção, essa estruturação
  // seria feita pelo próprio modelo de linguagem (function-calling / saída estruturada).
  function extrairSintomas() {
    const mensagensPaciente = mensagens.filter((m) => m.origem === 'Paciente');
    return mensagensPaciente.slice(0, 5).map((m) => ({
      descricao: m.conteudo,
      intensidade: null,
      duracao: null,
      discriminadorManchester: null
    }));
  }

  async function finalizarTriagem() {
    setFinalizando(true);
    try {
      const sintomas = extrairSintomas();
      const { data } = await TriagemApi.finalizar(triagemId, sintomas, null);
      setTriagemConcluida(true);
      setMensagens((prev) => [...prev, {
        origem: 'Chatbot',
        conteudo: data.mensagemFinal || MENSAGEM_FINAL,
        timestamp: new Date()
      }]);
    } catch {
      alert('Não foi possível finalizar a triagem agora. Tente novamente.');
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <div className="app-container chat-app" style={{ height: '100vh' }}>
      <div className="topbar">
        <div>
          <h1>Assistente de triagem</h1>
          <p>Online — respondendo agora</p>
        </div>
        {paciente && <span style={{ fontSize: 12 }}>{paciente.nome?.split(' ')[0]}</span>}
      </div>

      <div className="chat-window">
        {mensagens.map((m, i) => (
          <div key={i} className={`bubble ${m.origem === 'Paciente' ? 'paciente' : 'chatbot'}`}>
            {m.conteudo}
          </div>
        ))}
        {enviando && <div className="bubble chatbot">digitando...</div>}
        <div ref={fimRef} />
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Digite sua resposta..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar(texto)}
          disabled={triagemConcluida}
        />
        <button onClick={() => enviar(texto)} disabled={enviando || triagemConcluida}>Enviar</button>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        {triagemConcluida ? (
          <button className="primary" onClick={() => navigate('/')}>Voltar ao início</button>
        ) : (
          <button className="primary" onClick={finalizarTriagem} disabled={finalizando || enviando || mensagens.length < 2}>
            {finalizando ? 'Finalizando...' : 'Concluir triagem'}
          </button>
        )}
      </div>
    </div>
  );
}
