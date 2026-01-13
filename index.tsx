
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("%c Trotamundo %c Iniciando...", "color: white; background: #EE8F66; padding: 2px 6px; border-radius: 4px;", "color: #A39161;");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erro ao montar a aplicação React:", error);
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: #333;">
      <h2 style="color: #EE8F66;">Ops! Algo deu errado.</h2>
      <p>Houve um erro ao carregar o aplicativo. Verifique o console para mais detalhes.</p>
    </div>`;
  }
} else {
  console.error("Elemento root não encontrado!");
}
