
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Download, RotateCcw, Loader2 } from 'lucide-react';
import { editTravelPhoto } from '../services/geminiService.ts';

const AIPhotoEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-abril text-3xl text-slate-900">Editor de Viagem IA</h2>
        <p className="text-slate-500">Transforme suas memórias com a magia da Trotamundo.</p>
      </div>

      {!originalImage ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={32} />
          </div>
          <h3 className="font-bold text-slate-800">Carregue uma foto</h3>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-slate-200 aspect-video flex items-center justify-center shadow-lg">
            {loading && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-bold">A IA está trabalhando na sua foto...</p>
              </div>
            )}
            <img 
              src={editedImage || originalImage} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain" 
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: 'Adicione um filtro vintage'..."
              className="mt-1 w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
            />

            <div className="flex gap-2">
              <button
                onClick={handleApplyAI}
                disabled={loading || !prompt.trim()}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Aplicar Mágica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPhotoEditor;
