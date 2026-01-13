
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, FileText, Download, Bell, MessageSquare, ArrowRight, Clock, MapPinned, Plane, Hotel, Star, X, Sparkles, CheckCircle2, Compass, Loader2, Lock, Unlock, LogOut } from 'lucide-react';
import { getDestinationSuggestions } from '../services/geminiService.ts';
import { isSecureConnection, decryptData } from '../services/securityService.ts';

const DocumentIcon = ({ type }) => {
  switch (type) {
    case 'cartao_embarque': return <div className="p-3 bg-[#EE8F66]/10 text-[#EE8F66] rounded-xl"><ArrowRight size={20} className="-rotate-45" /></div>;
    case 'e-ticket': return <div className="p-3 bg-[#EE8F66]/10 text-[#EE8F66] rounded-xl"><FileText size={20} /></div>;
    case 'voucher_hospedagem': return <div className="p-3 bg-[#A39161]/10 text-[#A39161] rounded-xl"><Hotel size={20} /></div>;
    default: return <div className="p-3 bg-slate-100 text-slate-500 rounded-xl"><FileText size={20} /></div>;
  }
};

const AgendaItemIcon = ({ type }) => {
  switch (type) {
    case 'flight': return <div className="text-[#EE8F66]"><Plane size={18} /></div>;
    case 'hotel': return <div className="text-[#A39161]"><Hotel size={18} /></div>;
    case 'activity': return <div className="text-[#EE8F66]"><Star size={18} /></div>;
    default: return <div className="text-slate-400"><Clock size={18} /></div>;
  }
};

const SuggestionCard = ({ suggestion }) => {
  const isAgency = suggestion.source === 'agency';
  return (
    <div className={`relative p-6 rounded-[2.5rem] border transition-all duration-300 ${suggestion.isPurchased ? 'bg-green-50/30 border-green-200' : isAgency ? 'bg-white border-[#A39161]/20 shadow-lg shadow-[#A39161]/5' : 'bg-white border-[#EE8F66]/10 hover:border-[#EE8F66]/30 hover:shadow-xl'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${suggestion.isPurchased ? 'bg-green-100 text-green-600' : isAgency ? 'bg-[#A39161]/10 text-[#A39161]' : 'bg-[#FFFAF5] text-[#EE8F66]'}`}>
          {suggestion.isPurchased ? <CheckCircle2 size={20} /> : <Compass size={20} />}
        </div>
        {suggestion.isPurchased ? (
          <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-3 py-1 rounded-full">Confirmado</span>
        ) : (
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isAgency ? 'text-[#A39161] bg-[#A39161]/10' : 'text-[#EE8F66] bg-[#FFFAF5]'}`}>
            {isAgency ? 'Recomendação Trotamundo' : 'Dica Inteligente'}
          </span>
        )}
      </div>
      <h4 className="font-black text-slate-800 text-lg mb-2 leading-tight">{suggestion.title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">{suggestion.description}</p>
      {suggestion.reason && (
        <p className="text-[10px] italic text-[#A39161] font-medium border-t border-[#A39161]/10 pt-3">{suggestion.reason}</p>
      )}
    </div>
  );
};

// FIX: Removed mandatory unused prop onSelectTrip to resolve missing property error in App.tsx
const PassengerDashboard = ({ trips, onOpenChat, onLogout, hideHeaderFooter = false }) => {
  const [decryptedTrips, setDecryptedTrips] = useState([]);
  const [decrypting, setDecrypting] = useState(true);
  const [selectedAgendaTrip, setSelectedAgendaTrip] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
  const [secureMode] = useState(isSecureConnection());

  useEffect(() => {
    const performDecryption = async () => {
      setDecrypting(true);
      const results = [];
      for (const trip of trips) {
        if (trip.encryptedData) {
          try {
            const data = await decryptData(trip.encryptedData, trip.accessCode);
            results.push({ ...data, isDecrypted: true });
          } catch (e) {
            results.push(trip);
          }
        } else {
          results.push(trip);
        }
      }
      setDecryptedTrips(results);
      setDecrypting(false);
    };

    performDecryption();
  }, [trips]);

  const activeTrips = decryptedTrips.filter(t => t.status === 'ongoing' || t.status === 'upcoming');

  useEffect(() => {
    activeTrips.forEach(async (trip) => {
      if (!aiSuggestions[trip.id] && !loadingSuggestions[trip.id]) {
        setLoadingSuggestions(prev => ({ ...prev, [trip.id]: true }));
        try {
          const docs = trip.documents.map(d => d.name);
          const result = await getDestinationSuggestions(trip.destination, docs);
          setAiSuggestions(prev => ({ ...prev, [trip.id]: result }));
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSuggestions(prev => ({ ...prev, [trip.id]: false }));
        }
      }
    });
  }, [activeTrips]);

  const getAllSuggestions = (trip) => {
    const ai = aiSuggestions[trip.id] || [];
    const agency = trip.recommendations || [];
    return [...agency, ...ai];
  };

  const hasNewMessages = (trip) => trip.messages.some(m => m.sender === 'agency');

  if (decrypting) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-[#EE8F66]/10 border-t-[#EE8F66] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#EE8F66]">
            <Lock size={32} className="animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-abril text-3xl text-[#3D3D3D]">Acessando seu Cofre Digital</h2>
          <p className="text-[#A39161] font-medium italic">Seus dados estão sendo descriptografados com segurança.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-32">
      {hideHeaderFooter && onLogout && (
        <button 
          onClick={onLogout}
          className="fixed top-4 right-4 z-[100] bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-[#EE8F66]/20 text-[#EE8F66] hover:bg-[#EE8F66] hover:text-white transition-all group"
          title="Sair / Voltar ao Início"
        >
          <LogOut size={20} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-[10px] font-black uppercase tracking-widest ml-0 group-hover:ml-2">Sair</span>
        </button>
      )}

      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-abril text-4xl text-[#3D3D3D]">Seu Itinerário</h2>
            <p className="text-[#A39161] font-medium italic mt-1">Organização impecável para sua próxima descoberta.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A39161]">
              <Clock size={14} /> Sincronizado
            </div>
            {secureMode && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <Unlock size={10} className="text-green-500" /> DADOS LIBERADOS VIA E2E
              </div>
            )}
          </div>
        </div>
        
        {activeTrips.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border border-[#EE8F66]/10 shadow-sm">
            <div className="w-20 h-20 bg-[#FFFAF5] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#EE8F66]/5">
              <MapPinned size={32} className="text-[#EE8F66]/30" />
            </div>
            <p className="text-[#A39161] mb-8 font-medium text-lg italic">Suas próximas aventuras Trotamundo aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {activeTrips.map(trip => (
              <div key={trip.id} className="space-y-12">
                <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-[#EE8F66]/5 border border-[#EE8F66]/5 flex flex-col group transition-all duration-500">
                  <div className="bg-gradient-to-r from-[#EE8F66] to-[#A39161] p-10 md:p-14 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-[100px] -mr-16 -mt-16" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex gap-2">
                        <span className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-white/20 text-white">
                          {trip.status === 'ongoing' ? 'Em Andamento' : 'Em breve'}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedAgendaTrip(trip)} className="bg-white text-[#EE8F66] p-3 rounded-2xl transition-all flex items-center gap-2 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#3D3D3D] hover:text-white">
                          <Calendar size={16} /> Agenda
                        </button>
                        <button onClick={() => onOpenChat(trip.id)} className="bg-white/20 hover:bg-white text-white hover:text-[#EE8F66] p-3 rounded-2xl transition-all relative border border-white/20 group/chat">
                          <MessageSquare size={18} />
                          {hasNewMessages(trip) && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                               <span className="w-2 h-2 bg-[#EE8F66] rounded-full animate-pulse" />
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="relative z-10 max-w-2xl">
                      <h3 className="font-abril text-6xl md:text-8xl mb-6 tracking-tight leading-none drop-shadow-md">{trip.destination}</h3>
                      <div className="flex items-center gap-4 text-white/90 font-black text-[11px] uppercase tracking-[0.2em]">
                        <Calendar size={16} />
                        <span>{new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 md:p-14 grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white">
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-[#3D3D3D] flex items-center gap-3 uppercase tracking-widest text-xs">
                          <FileText size={18} className="text-[#EE8F66]" /> Documentação Privada
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {trip.documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-5 bg-[#FFFAF5]/50 rounded-[2rem] border border-[#EE8F66]/5 group hover:border-[#EE8F66]/30 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-5">
                              <DocumentIcon type={doc.type} />
                              <div>
                                <p className="font-bold text-[#3D3D3D] text-lg">{doc.name}</p>
                                <p className="text-[10px] text-[#A39161] font-black uppercase tracking-widest mt-1">{doc.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <button className="p-4 bg-white text-[#EE8F66] rounded-2xl hover:bg-[#EE8F66] hover:text-white transition-all shadow-sm border border-[#EE8F66]/10">
                              <Download size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-10">
                      <h4 className="font-black text-[#3D3D3D] flex items-center gap-3 uppercase tracking-widest text-xs">
                        <Bell size={18} className="text-[#A39161]" /> Atualizações de Voo & Estadia
                      </h4>
                      <div className="relative space-y-10 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EE8F66]/10">
                        {trip.updates.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((update, idx) => (
                          <div key={update.id} className="relative pl-12 group/update">
                            <div className={`absolute left-[7px] top-2 w-2 h-2 rounded-full border border-white ${idx === 0 ? 'bg-[#EE8F66] ring-4 ring-[#EE8F66]/10' : 'bg-[#A39161]/30'}`} />
                            <p className="text-[10px] font-black text-[#EE8F66] uppercase tracking-widest mb-2">{new Date(update.date).toLocaleDateString()}</p>
                            <p className="text-base text-[#3D3D3D] leading-relaxed font-medium">{update.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#EE8F66] p-2.5 rounded-xl text-white shadow-lg">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-[#3D3D3D] uppercase tracking-widest text-xs">Sugestões e Experiências</h4>
                      <p className="text-[10px] text-[#A39161] font-black uppercase tracking-[0.2em]">Curadoria Trotamundo em {trip.destination}</p>
                    </div>
                  </div>
                  {loadingSuggestions[trip.id] && !trip.recommendations?.length ? (
                    <div className="bg-white rounded-[3rem] p-16 flex flex-col items-center justify-center border border-[#EE8F66]/5 space-y-4">
                      <Loader2 size={32} className="text-[#EE8F66] animate-spin" />
                      <p className="text-[#A39161] font-medium italic">Preparando sugestões exclusivas para você...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getAllSuggestions(trip).map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedAgendaTrip && (
        <div className="fixed inset-0 z-[110] bg-[#3D3D3D]/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6">
          <div className="bg-white w-full max-w-4xl sm:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh] animate-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-br from-[#EE8F66] to-[#A39161] p-10 sm:p-14 text-white relative">
              <button onClick={() => setSelectedAgendaTrip(null)} className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white hover:text-[#EE8F66] rounded-full transition-all border border-white/20">
                <X size={24} />
              </button>
              <h3 className="font-abril text-6xl md:text-8xl tracking-tight leading-none">{selectedAgendaTrip.destination}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-10 sm:p-14 space-y-16 bg-[#FFFAF5]/30">
              {/* FIX: Explicitly type the accumulator as Record<string, any[]> to ensure 'items' in the map below has a known type with the 'slice' method */}
              {Object.entries(selectedAgendaTrip.agenda.reduce((acc: Record<string, any[]>, item) => {
                  const date = item.date;
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(item);
                  return acc;
                }, {})).sort((a, b) => a[0].localeCompare(b[0])).map(([date, items]) => (
                <div key={date} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="bg-white text-[#EE8F66] px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] border border-[#EE8F66]/10 shadow-sm">
                      {new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="flex-1 h-px bg-[#EE8F66]/10" />
                  </div>
                  <div className="space-y-6 pl-2">
                    {/* FIX: items is now correctly inferred as any[], resolving the 'unknown' type error on slice() */}
                    {items.slice().sort((a,b) => a.time.localeCompare(b.time)).map(item => (
                      <div key={item.id} className="flex gap-8 group/item">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-[#3D3D3D] bg-white px-3 py-1.5 rounded-xl border border-[#EE8F66]/10 group-hover/item:border-[#EE8F66] transition-colors">{item.time}</span>
                          <div className="w-px flex-1 bg-[#EE8F66]/10 my-4 group-last/item:hidden" />
                        </div>
                        <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-[#EE8F66]/5 hover:border-[#EE8F66]/20 transition-all duration-300 shadow-sm">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex gap-6">
                              <div className="mt-1 bg-[#FFFAF5] p-3.5 rounded-2xl shadow-sm border border-[#EE8F66]/10">
                                <AgendaItemIcon type={item.type} />
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-black text-[#3D3D3D] text-xl tracking-tight">{item.title}</h4>
                                <p className="text-base text-[#A39161] leading-relaxed max-w-md">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDashboard;
