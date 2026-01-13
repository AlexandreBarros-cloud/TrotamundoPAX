
import React from 'react';
import htm from 'htm';
import { Globe, LogOut, Home, WifiOff } from 'lucide-react';

const html = htm.bind(React.createElement);

const Layout = ({ children, logoUrl, userRole, onLogout, onViewChange, hideHeaderFooter = false, isOnline = true }) => {
  if (hideHeaderFooter) {
    return html`
      <div className="flex flex-col min-h-screen">
        ${!isOnline && html`
          <div className="bg-[#A39161] text-white text-[10px] font-black uppercase tracking-[0.3em] py-2 text-center animate-in slide-in-from-top duration-500">
            <div className="flex items-center justify-center gap-2">
              <${WifiOff} size=${12} /> Modo Viagem Offline — Dados Salvos Ativos
            </div>
          </div>
        `}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-4">${children}</main>
      </div>
    `;
  }

  return html`
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]/30">
      ${!isOnline && html`
        <div className="bg-[#A39161] text-white text-[10px] font-black uppercase tracking-[0.3em] py-2.5 text-center sticky top-0 z-[60] shadow-md">
          <div className="flex items-center justify-center gap-2">
            <${WifiOff} size=${14} /> Modo Viagem Offline — Itinerário Disponível
          </div>
        </div>
      `}
      
      <header className=${`bg-white/80 backdrop-blur-xl border-b border-[#EE8F66]/10 sticky ${!isOnline ? 'top-8' : 'top-0'} z-50 px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-500`}>
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer h-12 md:h-16" 
            onClick=${() => onViewChange(userRole === 'agency' ? 'agency-dashboard' : 'passenger-dashboard')}
          >
            ${logoUrl ? html`
              <img 
                src=${logoUrl} 
                alt="Trotamundo Logo" 
                className="h-full w-auto object-contain transition-transform hover:scale-105" 
              />
            ` : html`
              <div className="flex items-center gap-2">
                <div className="bg-[#EE8F66] p-2 rounded-xl text-white">
                  <${Globe} size=${24} />
                </div>
                <span className="font-abril text-2xl text-[#3D3D3D] hidden sm:block">Trotamundo</span>
              </div>
            `}
          </div>

          <button 
            onClick=${() => onViewChange('landing')}
            className="hidden md:flex items-center gap-2 text-[#A39161] hover:text-[#EE8F66] transition-colors font-bold text-[10px] uppercase tracking-widest bg-[#FFFAF5] px-4 py-2 rounded-full border border-[#EE8F66]/10"
          >
            <${Home} size=${14} />
            Início
          </button>
        </div>

        <nav className="flex items-center gap-3">
          <button 
            onClick=${onLogout}
            className="p-2.5 text-[#A39161] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 group"
          >
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">Sair</span>
            <${LogOut} size=${18} />
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        ${children}
      </main>

      <footer className="bg-white border-t border-[#A39161]/10 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-6 opacity-80 flex justify-center transition-all duration-500 cursor-default">
             ${logoUrl && html`
               <img src=${logoUrl} alt="Footer Logo" className="h-24 w-auto" />
             `}
          </div>
          <p className="font-abril text-2xl mb-2 text-[#3D3D3D] tracking-tight">Trotamundo Viagens</p>
          <div className="flex flex-col items-center gap-4">
            <p className="text-[#A39161] text-xs font-bold uppercase tracking-[0.2em]">Sua viagem na palma da mão</p>
            <p className="text-[#A39161]/20 text-[9px] font-black uppercase tracking-[0.4em] mt-2">© ${new Date().getFullYear()} — Portal Exclusivo</p>
          </div>
        </div>
      </footer>
    </div>
  `;
};

export default Layout;
