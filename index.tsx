
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 [Trotamundo] Iniciando script de entrada...");

const renderApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("❌ Erro: Elemento #root não encontrado no DOM.");
    return;
  }

  try {
    console.log("📦 [Trotamundo] Criando root do React...");
    const root = ReactDOM.createRoot(rootElement);
    
    console.log("🎨 [Trotamundo] Renderizando componente App...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ [Trotamundo] Renderização solicitada com sucesso.");
  } catch (err) {
    console.error("💥 Erro crítico durante a renderização:", err);
    throw err; // Lança para ser pego pelo window.onerror no index.html
  }
};

// Pequeno delay para garantir que o DOM e o importmap estejam prontos
if (document.readyState === 'complete') {
  renderApp();
} else {
  window.addEventListener('load', renderApp);
}
