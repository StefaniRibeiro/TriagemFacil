# Triagem Fácil – Frontend

## Descrição
Este é o frontend da aplicação **Triagem Fácil**, um sistema de triagem de pacientes desenvolvido com **React**, **TypeScript** e **Vite**.  O código original vem do repositório *sistema‑triagem* e foi integrado ao projeto `triagemFacil`.

> **Nota:** O backend ainda não está implementado.  As chamadas de API foram **mockadas** para permitir o desenvolvimento e testes da interface sem dependência do servidor.

## Tecnologias Utilizadas
- React 19
- TypeScript
- Vite (build rápido e HMR)
- Axios (cliente HTTP)
- ESLint + @vitejs/plugin-react

## Estrutura de Pastas
```
triagemFacil/
├─ public/                # arquivos estáticos (index.html, favicon, …)
├─ src/                  
│   ├─ api/               # camada de acesso à API (mockada)
│   ├─ pages/             # telas da aplicação (Identificação, Chatbot, Login, Dashboard)
│   ├─ styles/            # estilos globais
│   ├─ App.jsx            # definição das rotas
│   ├─ main.jsx           # ponto de entrada JSX
│   └─ main.tsx           # ponto de entrada TypeScript (re‑exporta main.jsx)
├─ vite.config.ts        # configuração do Vite
├─ tsconfig.app.json     # configuração do TypeScript (inclui "src")
├─ package.json          # dependências e scripts
└─ README.md             # **este arquivo**
```

## Como Rodar o Projeto (ambiente de desenvolvimento)
1. **Instalar as dependências**
   ```powershell
   cd "c:/Users/Positivo/Desktop/Stefani/Projetos/Front Triagem Fácil/triagemFacil"
   npm install
   ```
2. **Iniciar o servidor de desenvolvimento**
   ```powershell
   npm run dev
   ```
   O Vite abrirá o navegador em `http://localhost:5173`.
3. **Navegar nas telas**
   - `/` – Identificação do paciente
   - `/triagem/:triagemId` – Chatbot de triagem (dados simulados)
   - `/login` – Login (retorna token mockado)
   - `/dashboard` – Painel administrativo com dados fictícios

## Mock de API
As chamadas reais foram substituídas por promessas que retornam **dados estáticos**.  O arquivo responsável é:
```
src/api/api.js
```
Ele exporta objetos (`PacienteApi`, `ChatbotApi`, `TriagemApi`, `DashboardApi`, `AuthApi`) cujos métodos retornam `Promise.resolve({ data: … })`.  Quando o backend ficar disponível basta remover o helper `mockResponse` e deixar as chamadas `axios` inalteradas.

## Scripts Disponíveis
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o Vite em modo desenvolvimento (HMR). |
| `npm run build` | Gera a build de produção em `dist/`. |
| `npm run preview` | Executa um servidor local para a build produzida. |
| `npm run lint` | Roda o ESLint.

## Contribuindo
1. Fork o repositório.
2. Crie uma branch para sua feature/bugfix.
3. Execute os testes (se houver) e o lint.
4. Abra um Pull Request descrevendo as mudanças.

## Licença
Este projeto está licenciado sob a **MIT License** – sinta‑se livre para usar, modificar e distribuir.

---
*Este README foi gerado automaticamente por Antigravity.*
