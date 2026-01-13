
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Get destination suggestions based on travel documents using Gemini
export const getDestinationSuggestions = async (destination: string, documentNames: string[]): Promise<Suggestion[]> => {
  try {
    const ai = getAI();
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
 * Edits a travel photo using Gemini's image editing capabilities with gemini-2.5-flash-image.
 * @param base64Data The original image as a base64 data URL.
 * @param prompt The user's editing instruction.
 * @returns The edited image as a base64 data URL or null on failure.
 */
export const editTravelPhoto = async (base64Data: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    
    // Extract mime type and base64 string from data URL
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 data");
    
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

    // Iterate through response parts to find the edited image
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          const returnedMimeType: string = part.inlineData.mimeType;
          return `data:${returnedMimeType};base64,${base64EncodeString}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error editing photo with Gemini:", error);
    return null;
  }
};
