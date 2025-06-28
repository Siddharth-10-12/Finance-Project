
import { GoogleGenerativeAI } from "@google/generative-ai";

import { GEMINI_API_KEY } from "./config";
const apiKey = GEMINI_API_KEY;

export async function askGemini(question) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const chatSession = model.startChat({
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
    history: [],
  });

  try {
    const result = await chatSession.sendMessage(question);
    return result.response.text();
  } catch (error) {
    console.error("Error fetching response from Gemini:", error);
    return "Error: Unable to fetch response.";
  }
}
