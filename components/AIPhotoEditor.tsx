
import React, { useState, useRef } from 'react';
import htm from 'htm';
import { Upload, Sparkles, Download, RotateCcw, Loader2 } from 'lucide-react';
import { editTravelPhoto } from '../services/geminiService.ts';

const html = htm.bind(React.createElement);

const AIPhotoEditor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAI = async () => {
    if (!originalImage || !prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await editTravelPhoto(originalImage, prompt);
      if (result) {
        setEditedImage(result);
      } else {
        setError("Não foi possível processar a imagem. Tente outro comando.");
      }
    } catch (err) {
      setError("Erro ao conectar com a IA. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = editedImage || originalImage || '';
    link.download = `trotamundo-edit-${Date.now()}.png`;
    link.click();
  };

  return html`
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-abril text-3xl text-slate-900">Editor de Viagem IA</h2>
        <p className="text-slate-500">Transforme suas memórias com a magia da Trotamundo.</p>
      </div>

      ${!originalImage ? html`
        <div 
          onClick=${() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-[#EE8F66] hover:bg-[#FFFAF5] transition-all"
        >
          <div className="bg-[#FFFAF5] text-[#EE8F66] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EE8F66]/10 shadow-sm">
            <${Upload} size=${32} />
          </div>
          <h3 className="font-bold text-slate-800">Carregue uma foto</h3>
          <input 
            type="file" 
            ref=${fileInputRef} 
            onChange=${handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ` : html`
        <div className="space-y-6">
          <div className="relative rounded-[2rem] overflow-hidden bg-slate-200 aspect-video flex items-center justify-center shadow-xl border border-slate-100">
            ${loading && html`
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
                <${Loader2} size=${48} className="animate-spin mb-4" />
                <p className="font-bold">A IA Trotamundo está reimaginando sua foto...</p>
              </div>
            `}
            <img 
              src=${editedImage || originalImage} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain" 
            />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-[#EE8F66]/10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A39161] ml-4">O que deseja alterar?</label>
              <textarea
                value=${prompt}
                onChange=${(e) => setPrompt(e.target.value)}
                placeholder="Ex: 'Adicione um pôr do sol épico ao fundo' ou 'Remova as pessoas atrás'..."
                className="w-full p-6 rounded-2xl bg-[#FFFAF5] border border-[#EE8F66]/10 focus:ring-4 focus:ring-[#EE8F66]/10 outline-none resize-none h-32 font-medium"
              />
            </div>

            <div className="flex gap-4">
               <button
                onClick=${() => { setOriginalImage(null); setEditedImage(null); }}
                className="p-5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                title="Reiniciar"
              >
                <${RotateCcw} size=${20} />
              </button>
              <button
                onClick=${handleApplyAI}
                disabled=${loading || !prompt.trim()}
                className="flex-1 bg-gradient-to-r from-[#EE8F66] to-[#A39161] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50 shadow-xl shadow-[#EE8F66]/20"
              >
                <${Sparkles} size=${20} />
                Aplicar Mágica
              </button>
              ${editedImage && html`
                <button
                  onClick=${downloadImage}
                  className="p-5 bg-[#3D3D3D] text-white rounded-2xl hover:bg-black transition-all shadow-lg"
                  title="Baixar Foto"
                >
                  <${Download} size=${20} />
                </button>
              `}
            </div>
            
            ${error && html`<p className="text-red-500 text-xs font-bold text-center bg-red-50 p-4 rounded-xl">${error}</p>`}
          </div>
        </div>
      `}
    </div>
  `;
};

export default AIPhotoEditor;
