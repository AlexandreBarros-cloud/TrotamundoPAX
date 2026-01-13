
import React, { useState } from 'react';
import htm from 'htm';
import { Globe, User, ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff, Info } from 'lucide-react';

const html = htm.bind(React.createElement);

const LandingPage = ({ onLogin, logoUrl, isEmbedded = false }) => {
  const [view, setView] = useState('selection');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassengerCode, setShowPassengerCode] = useState(false);
  const [showAgencyPassword, setShowAgencyPassword] = useState(false);

  const handlePassengerSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const success = onLogin('passenger', code);
      if (!success) {
        setError('Código inválido. Tente PARIS24 para testar.');
        setLoading(false);
      }
    }, 800);
  };

  const handleAgencySubmit = (e) => {
    e.preventDefault();
    if (code === 'ADMIN123') {
      onLogin('agency');
    } else {
      setError('Acesso negado. Use ADMIN123.');
    }
  };

  const resetToggles = () => {
    setShowPassengerCode(false);
    setShowAgencyPassword(false);
    setCode('');
    setError('');
  };

  return html`
    <div className=${`min-h-screen relative flex flex-col items-center justify-center p-6 bg-[#FFFAF5] overflow-hidden ${isEmbedded ? 'min-h-[600px]' : ''}`}>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#EE8F66]/5 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A39161]/5 rounded-full blur-[120px] z-0" />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
        <div className="space-y-8 flex flex-col items-center">
          ${logoUrl ? html`
            <div className=${`mb-4 animate-in fade-in zoom-in duration-1000 ${isEmbedded ? 'scale-75' : ''}`}>
              <img 
                src=${logoUrl} 
                alt="Trotamundo Logo" 
                className="h-32 md:h-48 w-auto object-contain transition-transform hover:scale-105 duration-700" 
              />
            </div>
          ` : html`
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-[#EE8F66]/20 text-[#EE8F66] mb-8 shadow-sm">
              <${Globe} size=${24} />
              <span className="text-lg font-bold tracking-[0.1em] uppercase">Trotamundo Viagens</span>
            </div>
          `}
          
          <div className="space-y-4">
            <h1 className=${`font-abril text-[#3D3D3D] leading-[1.1] ${isEmbedded ? 'text-4xl' : 'text-5xl md:text-7xl'}`}>
              Para viajar basta existir.
            </h1>
            <p className=${`text-[#A39161] font-medium mx-auto leading-relaxed italic ${isEmbedded ? 'text-lg' : 'text-xl md:text-2xl'}`}>
              Sua jornada começa aqui.
            </p>
          </div>
        </div>

        ${view === 'selection' && html`
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button 
              onClick=${() => { setView('passenger-login'); resetToggles(); }}
              className="group flex flex-col items-center gap-5 bg-white p-10 rounded-[2.5rem] hover:bg-white transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-[#EE8F66]/10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#EE8F66] to-[#A39161] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <${User} size=${32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-[#3D3D3D] text-xl tracking-tight uppercase">Minha Viagem</span>
                <span className="text-[#A39161] text-[10px] font-black tracking-widest uppercase mt-1">Acesso Passageiro</span>
              </div>
            </button>

            <button 
              onClick=${() => { setView('agency-login'); resetToggles(); }}
              className="group flex flex-col items-center gap-5 bg-white p-10 rounded-[2.5rem] hover:bg-white transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2 border border-[#A39161]/10"
            >
              <div className="w-16 h-16 bg-[#3D3D3D] rounded-2xl flex items-center justify-center text-[#A39161] group-hover:bg-black transition-all">
                <${ShieldCheck} size=${32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-[#3D3D3D] text-xl tracking-tight uppercase">Painel Agente</span>
                <span className="text-[#A39161] text-[10px] font-black tracking-widest uppercase mt-1">Gestão da Agência</span>
              </div>
            </button>
          </div>
        `}

        ${view === 'passenger-login' && html`
          <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-400">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-[#EE8F66]/10 space-y-8 relative">
              <div className="text-left flex items-center gap-4 mb-2">
                <button onClick=${() => {setView('selection'); setError('');}} className="p-2 text-[#A39161] hover:text-[#EE8F66] transition-colors bg-[#FFFAF5] rounded-full">
                  <${ArrowLeft} size=${18} />
                </button>
                <h3 className="text-[#3D3D3D] font-black uppercase tracking-widest text-sm">Entrar como Passageiro</h3>
              </div>
              
              <form onSubmit=${handlePassengerSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-[#A39161] text-[10px] font-black uppercase tracking-[0.2em] ml-2">Código da Reserva</label>
                  <div className="relative group/input">
                    <input 
                      type=${showPassengerCode ? "text" : "password"}
                      placeholder="Ex: PARIS24"
                      value=${code}
                      onChange=${(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#FFFAF5] border border-[#EE8F66]/20 rounded-2xl pl-6 pr-14 py-5 text-[#3D3D3D] placeholder:text-[#EE8F66]/30 focus:ring-4 focus:ring-[#EE8F66]/10 focus:border-[#EE8F66] outline-none transition-all font-bold tracking-widest text-center uppercase"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick=${() => setShowPassengerCode(!showPassengerCode)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#A39161]/40 hover:text-[#EE8F66] transition-colors"
                    >
                      ${showPassengerCode ? html`<${EyeOff} size=${20} />` : html`<${Eye} size=${20} />`}
                    </button>
                  </div>
                </div>
                
                ${error && html`<p className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100 text-center animate-bounce">${error}</p>`}
                
                <button 
                  type="submit"
                  disabled=${loading || !code.trim()}
                  className="w-full bg-gradient-to-r from-[#EE8F66] to-[#A39161] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-[#EE8F66]/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                >
                  ${loading ? html`<${Loader2} size=${18} className="animate-spin" />` : 'Confirmar e Acessar'}
                </button>
              </form>

              <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-[#A39161]/60 uppercase tracking-widest">
                <${Info} size=${12} /> Dica de teste: Use PARIS24
              </div>
            </div>
          </div>
        `}

        ${view === 'agency-login' && html`
          <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-400">
            <div className="bg-[#3D3D3D] p-10 rounded-[3rem] shadow-2xl space-y-8">
              <div className="text-left flex items-center gap-4 mb-2">
                <button onClick=${() => {setView('selection'); setError('');}} className="p-2 text-white/30 hover:text-[#EE8F66] transition-colors bg-white/5 rounded-full">
                  <${ArrowLeft} size=${18} />
                </button>
                <h3 className="text-white/70 font-black uppercase tracking-widest text-sm">Acesso Administrativo</h3>
              </div>
              
              <form onSubmit=${handleAgencySubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Senha da Agência</label>
                  <div className="relative">
                    <input 
                      type=${showAgencyPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value=${code}
                      onChange=${(e) => setCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-5 text-white placeholder:text-white/10 focus:ring-4 focus:ring-[#EE8F66]/20 outline-none transition-all text-center"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick=${() => setShowAgencyPassword(!showAgencyPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-[#EE8F66] transition-colors"
                    >
                      ${showAgencyPassword ? html`<${EyeOff} size=${20} />` : html`<${Eye} size=${20} />`}
                    </button>
                  </div>
                </div>
                
                ${error && html`<p className="text-red-400 text-xs font-bold text-center">${error}</p>`}
                
                <button 
                  type="submit"
                  className="w-full bg-white text-[#3D3D3D] font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs hover:bg-[#EE8F66] hover:text-white"
                >
                  Acessar Dashboard
                </button>
              </form>

              <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                <${Info} size=${12} /> Dica de teste: Use ADMIN123
              </div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
};

export default LandingPage;
