
import React, { useState } from 'react';
import { Plus, Search, FileText, Edit3, MessageCircle, Upload, Calendar, Key, Globe, Compass, X, Pencil, Sparkles, User, MapPin } from 'lucide-react';
import { Trip, DocumentType, Suggestion } from '../types.ts';
import { generateAccessCode } from '../services/securityService.ts';

interface AgencyDashboardProps {
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
  onLogoUpload: (url: string) => void;
  onOpenChat: (tripId: string) => void;
}

const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ trips, onAddTrip, onUpdateTrip, onLogoUpload, onOpenChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  
  const [newTripForm, setNewTripForm] = useState<Partial<Trip>>({
    passengerName: '',
    destination: '',
    accessCode: '',
    startDate: '',
    endDate: '',
  });

  const [recForm, setRecForm] = useState<Partial<Suggestion>>({
    id: undefined,
    title: '',
    description: '',
    type: 'cultura',
    isPurchased: false
  });

  const filteredTrips = trips.filter(t => 
    t.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNewTrip = () => {
    if (!newTripForm.passengerName || !newTripForm.destination || !newTripForm.accessCode) return;

    onAddTrip({
      id: Math.random().toString(),
      accessCode: newTripForm.accessCode!.toUpperCase(),
      passengerName: newTripForm.passengerName!,
      destination: newTripForm.destination!,
      startDate: newTripForm.startDate || new Date().toISOString(),
      endDate: newTripForm.endDate || new Date().toISOString(),
      status: 'upcoming',
      documents: [],
      updates: [],
      messages: [],
      agenda: [],
      recommendations: []
    });
    
    setIsNewTripModalOpen(false);
    setNewTripForm({ passengerName: '', destination: '', accessCode: '', startDate: '', endDate: '' });
  };

  const autoGenerateCode = () => {
    if (newTripForm.destination) {
      const code = generateAccessCode(newTripForm.destination);
      setNewTripForm(prev => ({ ...prev, accessCode: code }));
    }
  };

  const handleAddUpdate = (tripId: string) => {
    const desc = prompt("Descreva a mudança na viagem:");
    if (!desc) return;
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      onUpdateTrip({
        ...trip,
        updates: [...trip.updates, { id: Math.random().toString(), date: new Date().toISOString(), description: desc }]
      });
    }
  };

  const handleAddDocument = (tripId: string) => {
    const docName = prompt("Nome do documento (ex: E-Ticket LATAM):");
    const docType = prompt("Tipo (e-ticket, voucher_hospedagem, cartao_embarque, voucher_servico):") as DocumentType;
    if (!docName || !docType) return;
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      onUpdateTrip({
        ...trip,
        documents: [...trip.documents, { id: Math.random().toString(), name: docName, type: docType, url: '#', uploadDate: new Date().toISOString() }]
      });
    }
  };

  const openAddRecommendation = (tripId: string) => {
    setActiveTripId(tripId);
    setRecForm({ id: undefined, title: '', description: '', type: 'cultura', isPurchased: false });
  };

  const openEditRecommendation = (tripId: string, rec: Suggestion) => {
    setActiveTripId(tripId);
    setRecForm({ id: rec.id, title: rec.title, description: rec.description, type: rec.type, isPurchased: rec.isPurchased });
  };

  const handleSaveRecommendation = () => {
    if (!recForm.title || !recForm.description || !activeTripId) return;
    const trip = trips.find(t => t.id === activeTripId);
    if (trip) {
      const isEditing = !!recForm.id;
      let updatedRecommendations: Suggestion[];
      if (isEditing) {
        updatedRecommendations = (trip.recommendations || []).map(r => r.id === recForm.id ? { ...r, ...recForm as Suggestion, source: 'agency' } : r);
      } else {
        updatedRecommendations = [...(trip.recommendations || []), { id: Math.random().toString(), title: recForm.title!, description: recForm.description!, type: recForm.type as any, isPurchased: recForm.isPurchased || false, source: 'agency', reason: 'Sugestão personalizada da sua agência' }];
      }
      onUpdateTrip({ ...trip, recommendations: updatedRecommendations });
      setActiveTripId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-abril text-4xl text-[#3D3D3D]">Gestão de Viagens</h1>
          <p className="text-[#A39161] font-medium italic">Transformando sonhos em itinerários reais.</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-[#EE8F66]/10 cursor-pointer hover:bg-[#FFFAF5] transition-all shadow-sm">
            <Upload size={18} className="text-[#EE8F66]" />
            <span className="text-sm font-bold text-[#3D3D3D]">Alterar Logo</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => onLogoUpload(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </label>
          <button 
            onClick={() => setIsNewTripModalOpen(true)}
            className="flex items-center gap-2 bg-[#EE8F66] text-white px-6 py-2.5 rounded-2xl hover:bg-[#A39161] transition-all shadow-lg font-bold"
          >
            <Plus size={20} /> Nova Viagem
          </button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A39161]/40 group-focus-within:text-[#EE8F66] transition-colors" size={20} />
        <input type="text" placeholder="Buscar por passageiro ou destino..." className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-[#EE8F66]/10 focus:ring-4 focus:ring-[#EE8F66]/5 focus:border-[#EE8F66] outline-none transition-all bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map(trip => (
          <div key={trip.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#EE8F66]/5 flex flex-col hover:shadow-xl hover:border-[#EE8F66]/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Key size={12} className="text-[#EE8F66]" />
                  <span className="text-[10px] font-black text-[#EE8F66] uppercase tracking-widest">{trip.accessCode}</span>
                </div>
                <h3 className="font-bold text-xl text-[#3D3D3D]">{trip.passengerName}</h3>
                <p className="text-[#A39161] font-bold text-sm tracking-tight">{trip.destination}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${trip.status === 'ongoing' ? 'bg-green-50 text-green-600' : trip.status === 'upcoming' ? 'bg-[#FFFAF5] text-[#EE8F66]' : 'bg-slate-50 text-slate-500'}`}>
                {trip.status.toUpperCase()}
              </span>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#A39161]">
                <span className="bg-[#FFFAF5] px-3 py-1.5 rounded-lg border border-[#EE8F66]/5">{new Date(trip.startDate).toLocaleDateString()}</span>
                <span className="text-[#EE8F66]/30">──</span>
                <span className="bg-[#FFFAF5] px-3 py-1.5 rounded-lg border border-[#EE8F66]/5">{new Date(trip.endDate).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#A39161] uppercase tracking-widest">Documentos ({trip.documents.length})</span>
                  <button onClick={() => handleAddDocument(trip.id)} className="text-[#EE8F66] text-[10px] font-black uppercase hover:underline">Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {trip.documents.slice(0, 3).map(doc => (
                    <div key={doc.id} className="bg-[#FFFAF5] px-2 py-1 rounded-lg text-[10px] font-bold text-[#A39161] border border-[#EE8F66]/5 flex items-center gap-1">
                      <FileText size={10} /> <span className="max-w-[80px] truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-50">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-[#A39161] uppercase tracking-widest">Recomendações ({trip.recommendations?.length || 0})</span>
                    <button onClick={() => openAddRecommendation(trip.id)} className="text-[#EE8F66] text-[10px] font-black uppercase hover:underline flex items-center gap-1"><Plus size={10}/> Sugerir</button>
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                    {trip.recommendations?.map((rec, i) => (
                      <div key={i} className="bg-[#EE8F66]/5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#EE8F66] border border-[#EE8F66]/10 flex items-center gap-1.5 group/rec transition-all hover:bg-[#EE8F66]/10">
                        {rec.title} {rec.source === 'agency' && <button onClick={() => openEditRecommendation(trip.id, rec)} className="p-0.5 hover:text-[#3D3D3D] transition-colors"><Pencil size={10} /></button>}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <button onClick={() => handleAddUpdate(trip.id)} className="flex items-center justify-center gap-2 bg-[#3D3D3D] text-white py-3 rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-md"><Edit3 size={14} /> Atualizar</button>
              <button onClick={() => onOpenChat(trip.id)} className="flex items-center justify-center gap-2 bg-[#EE8F66]/5 text-[#EE8F66] py-3 rounded-2xl text-xs font-bold hover:bg-[#EE8F66]/10 transition-all border border-[#EE8F66]/10"><MessageCircle size={14} /> Mensagem</button>
            </div>
          </div>
        ))}
      </div>

      {isNewTripModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 relative overflow-hidden">
            <button onClick={() => setIsNewTripModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-[#EE8F66] transition-colors"><X size={24}/></button>
            <div className="flex items-center gap-4">
              <div className="bg-[#EE8F66] p-3 rounded-2xl text-white shadow-lg"><Globe size={24}/></div>
              <div>
                <h3 className="font-abril text-3xl text-[#3D3D3D]">Planejar Nova Viagem</h3>
                <p className="text-[#A39161] text-xs font-bold uppercase tracking-widest italic">Criação de Itinerário Exclusivo</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#A39161] ml-4">Nome do Passageiro</label>
                  <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#EE8F66]" />
                    <input type="text" placeholder="Maria Silva" className="w-full bg-[#FFFAF5] border border-[#EE8F66]/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#EE8F66]/20 font-bold" value={newTripForm.passengerName} onChange={e => setNewTripForm({...newTripForm, passengerName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#A39161] ml-4">Destino Principal</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#EE8F66]" />
                    <input type="text" placeholder="Tóquio, Japão" className="w-full bg-[#FFFAF5] border border-[#EE8F66]/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#EE8F66]/20 font-bold" value={newTripForm.destination} onChange={e => setNewTripForm({...newTripForm, destination: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#A39161] ml-4">Chave de Acesso (E2E)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#EE8F66]" />
                    <input type="text" placeholder="Gerar código..." className="w-full bg-[#FFFAF5] border border-[#EE8F66]/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#EE8F66]/20 font-black tracking-widest uppercase" value={newTripForm.accessCode} onChange={e => setNewTripForm({...newTripForm, accessCode: e.target.value.toUpperCase()})} />
                  </div>
                  <button onClick={autoGenerateCode} disabled={!newTripForm.destination} className="bg-white border border-[#EE8F66]/20 text-[#EE8F66] p-4 rounded-2xl hover:bg-[#EE8F66]/5 transition-all disabled:opacity-30" title="Gerar Chave Inteligente">
                    <Sparkles size={20} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setIsNewTripModalOpen(false)} className="flex-1 border border-[#EE8F66]/10 text-[#A39161] font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
              <button onClick={handleCreateNewTrip} className="flex-1 bg-[#EE8F66] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-[#EE8F66]/20 hover:bg-[#A39161] transition-all">Criar Viagem</button>
            </div>
          </div>
        </div>
      )}

      {activeTripId && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 space-y-8 relative overflow-hidden">
            <button onClick={() => setActiveTripId(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-[#EE8F66] transition-colors"><X size={24}/></button>
            <div className="flex items-center gap-4">
              <div className="bg-[#EE8F66] p-3 rounded-2xl text-white shadow-lg"><Compass size={24}/></div>
              <div>
                <h3 className="font-abril text-2xl text-[#3D3D3D]">{recForm.id ? 'Editar Experiência' : 'Sugerir Experiência'}</h3>
                <p className="text-[#A39161] text-xs font-bold uppercase tracking-widest italic">Personalize a viagem do seu cliente</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A39161]">Título da Experiência</label>
                <input type="text" value={recForm.title} onChange={(e) => setRecForm({...recForm, title: e.target.value})} placeholder="Ex: Jantar na Torre Eiffel" className="w-full bg-[#FFFAF5] border border-[#EE8F66]/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#EE8F66]/20 font-bold text-[#3D3D3D]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A39161]">Descrição</label>
                <textarea value={recForm.description} onChange={(e) => setRecForm({...recForm, description: e.target.value})} placeholder="Explique por que essa atividade é imperdível..." className="w-full bg-[#FFFAF5] border border-[#EE8F66]/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#EE8F66]/20 text-sm min-h-[100px] resize-none" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setActiveTripId(null)} className="flex-1 border border-[#EE8F66]/10 text-[#A39161] font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
              <button onClick={handleSaveRecommendation} className="flex-1 bg-[#EE8F66] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-[#EE8F66]/20 hover:bg-[#A39161] transition-all">{recForm.id ? 'Salvar Alterações' : 'Salvar Sugestão'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyDashboard;
