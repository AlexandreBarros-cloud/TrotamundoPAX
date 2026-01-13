
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, Sparkles, Loader2, User, Headset } from 'lucide-react';
import { ChatMessage, Trip } from '../types.ts';
import { GoogleGenAI } from "@google/genai";

interface ChatWindowProps {
  trip: Trip;
  userRole: 'passenger' | 'agency';
  // Fix: changed from void to () => void to allow function passing and event handling
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ trip, userRole, onClose, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trip.messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const suggestReply = async () => {
    if (userRole !== 'agency' || trip.messages.length === 0) return;
    
    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lastMessage = trip.messages[trip.messages.length - 1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um agente da Trotamundo Viagens. O passageiro ${trip.passengerName} em viagem para ${trip.destination} disse: "${lastMessage.text}". Sugira uma resposta curta, profissional e amigável em português. Retorne apenas o texto da resposta.`,
      });
      
      const suggestion = response.text || '';
      setInputText(suggestion.trim());
    } catch (error) {
      console.error("Erro ao sugerir resposta:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-10 sm:bottom-10 sm:w-[420px] sm:h-[680px] bg-white shadow-3xl z-[100] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-[#EE8F66]/10 overflow-hidden animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-[#EE8F66] to-[#A39161] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
            {userRole === 'passenger' ? <Headset size={24} /> : <User size={24} />}
          </div>
          <div>
            <h3 className="font-abril text-xl tracking-tight leading-none">
              {userRole === 'passenger' ? 'Concierge Trotamundo' : trip.passengerName}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <p className="text-[10px] text-white/60 uppercase font-black tracking-[0.2em]">Sempre online</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFAF5]/50">
        {trip.messages.length === 0 && (
          <div className="text-center py-16 px-10">
            <div className="w-20 h-20 bg-white text-[#EE8F66] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#EE8F66]/10 shadow-sm">
              <Sparkles size={28} />
            </div>
            <p className="text-[#A39161] text-sm font-medium leading-relaxed italic">"A Trotamundo está à sua disposição. Como podemos tornar sua jornada para {trip.destination} ainda mais especial?"</p>
          </div>
        )}
        {trip.messages.map((msg) => {
          const isMe = msg.sender === userRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                isMe 
                  ? 'bg-[#EE8F66] text-white rounded-br-none' 
                  : 'bg-white text-[#3D3D3D] rounded-bl-none border border-[#EE8F66]/5'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-white border-t border-[#EE8F66]/10 space-y-4">
        {userRole === 'agency' && trip.messages.length > 0 && (
          <button 
            onClick={suggestReply}
            disabled={isSuggesting}
            className="text-[10px] font-black text-[#EE8F66] flex items-center gap-2 hover:bg-[#EE8F66]/5 px-3 py-1.5 rounded-xl transition-all uppercase tracking-widest border border-[#EE8F66]/10"
          >
            {isSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Sugestão IA Trotamundo
          </button>
        )}
        <div className="flex gap-3 bg-[#FFFAF5] p-2 rounded-[2rem] border border-[#EE8F66]/10 shadow-inner focus-within:ring-2 focus-within:ring-[#EE8F66]/20 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite aqui..."
            className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:ring-0 outline-none text-[#3D3D3D] font-medium"
          />
          <button 
            onClick={handleSend}
            className="bg-gradient-to-r from-[#EE8F66] to-[#A39161] text-white p-4 rounded-full"
            disabled={!inputText.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
