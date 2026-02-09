
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FeedbackResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const gradeAnswer = async (questionText: string, studentAnswer: string, schema: any): Promise<FeedbackResult | null> => {
  if (!studentAnswer.trim()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `
      Question: ${questionText}
      Marking Scheme: 
      IU1: ${schema.IU1}
      IS1: ${schema.IS1}
      IU2: ${schema.IU2}
      IS2: ${schema.IS2}

      Student Answer: "${studentAnswer}"

      Grade this answer strictly according to the rules. Return only valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                IU1: { type: Type.BOOLEAN },
                IS1: { type: Type.BOOLEAN },
                IU2: { type: Type.BOOLEAN },
                IS2: { type: Type.BOOLEAN },
                hasGrammarError: { type: Type.BOOLEAN }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Error grading answer:", error);
    return null;
  }
};
