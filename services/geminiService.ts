import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FeedbackResult } from "../types";

export const gradeAnswer = async (questionText: string, studentAnswer: string, schema: any): Promise<FeedbackResult | null> => {
  if (!studentAnswer.trim()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const prompt = `
      Question: ${questionText}
      Marking Scheme: 
      IU1: ${schema.IU1}
      IS1: ${schema.IS1}
      IU2: ${schema.IU2}
      IS2: ${schema.IS2}

      Student Answer: "${studentAnswer}"

      Grade this answer strictly according to the rules provided in the system instruction. 
      Analyze for presence of IU/IS pairs and grammar.
      Return only valid JSON.
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
              },
              required: ["IU1", "IS1", "IU2", "IS2", "hasGrammarError"]
            }
          },
          required: ["score", "feedback", "breakdown"]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty response from Gemini");
    }

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Error grading answer:", error);
    // Return a structured error result to avoid crashing the UI
    return {
      questionId: 0,
      score: 0,
      feedback: "Maaf, ralat berlaku semasa memproses jawapan. Sila cuba sebentar lagi.",
      breakdown: {
        IU1: false, IS1: false, IU2: false, IS2: false, hasGrammarError: true
      }
    };
  }
};