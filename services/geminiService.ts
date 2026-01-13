import { GoogleGenAI, Type } from "@google/genai";

export const getDestinationSuggestions = async (destination, documentNames) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é um guia especializado da Trotamundo Viagens. 
      Destino: ${destination}. 
      Documentos já emitidos para este passageiro: ${documentNames.join(', ')}.
      
      Sugira 5 experiências imperdíveis. Para cada sugestão, verifique se algum dos documentos listados já parece cobrir essa atividade (ex: se há um voucher para 'Museu do Louvre', a sugestão 'Visita ao Louvre' deve marcar isPurchased como true).
      
      Retorne sugestões variadas e refinadas. Adicione source: 'ai' em cada uma.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { 
                type: Type.STRING, 
                enum: ['gastronomia', 'cultura', 'aventura', 'relaxamento'] 
              },
              isPurchased: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              source: { type: Type.STRING }
            },
            required: ["title", "description", "type", "isPurchased", "source"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

/**
 * Edit travel photos using Gemini 2.5 Flash Image model.
 * Adds/removes elements or changes the scene based on a text prompt.
 */
export const editTravelPhoto = async (base64Image: string, prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Strip data URL prefix to get raw base64 data for the Gemini API
    const base64Data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through response parts to find the generated image (inlineData)
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing travel photo:", error);
    return null;
  }
};