
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
 * Edit travel photo using Gemini AI
 * Uses gemini-2.5-flash-image to process the image and prompt
 */
export const editTravelPhoto = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract base64 and mimeType from data URL
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      console.error("Invalid base64 image format");
      return null;
    }
    
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error editing travel photo:", error);
    return null;
  }
};
