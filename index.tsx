
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Polifill de segurança para evitar erro de "process is not defined" no navegador
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as any;
}

console.log("%c Trotamundo %c Booting Engine...", "color: white; background: #EE8F66; padding: 2px 6px; border-radius: 4px;", "color: #A39161;");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Trotamundo: Renderização concluída com sucesso.");
  } catch (error) {
    console.error("Erro fatal na inicialização:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #EE8F66;">Erro de Inicialização</h2>
        <p>Não foi possível carregar os componentes. Verifique sua conexão ou a chave da API.</p>
      </div>
    `;
  }
}
