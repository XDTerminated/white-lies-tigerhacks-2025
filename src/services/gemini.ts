import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from '../data/marsFacts';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getChatResponse(userMessage: string): Promise<string> {
  try {
    console.log('🤖 Gemini: Sending message:', userMessage);
    
    // Try gemini-2.5-flash which may have different rate limits
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
    });
    
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('✅ Gemini response:', responseText);
    
    return responseText;
  } catch (error) {
    console.error('❌ Gemini error:', error);
    throw new Error('Failed to get response from AI');
  }
}
