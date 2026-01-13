
import React, { useEffect, useState } from 'react';
import { MessageSquare, X, BellRing } from 'lucide-react';

interface NotificationToastProps {
  show: boolean;
  message: string;
  senderName: string;
  onClose: () => void;
  onClick: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ show, message, senderName, onClose, onClick }) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md transition-all duration-500 transform ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
      }`}
    >
      <div 
        onClick={onClick}
        className="bg-white/90 backdrop-blur-2xl border border-[#EE8F66]/20 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 cursor-pointer hover:bg-white transition-all group"
      >
        <div className="bg-gradient-to-br from-[#EE8F66] to-[#A39161] p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
          <MessageSquare size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black text-[#EE8F66] uppercase tracking-widest">Nova Mensagem</span>
            <div className="w-1 h-1 bg-[#EE8F66] rounded-full animate-pulse" />
          </div>
          <p className="font-bold text-[#3D3D3D] text-sm truncate">{senderName}</p>
          <p className="text-[#A39161] text-xs truncate italic">"{message}"</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 text-[#A39161]/40 hover:text-[#EE8F66] transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
