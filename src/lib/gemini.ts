import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, CodeChallenge } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const SYSTEM_PROMPT = `Tu ek expert AI programming tutor hai, jo React, Node.js, aur JavaScript mein specialist hai. Tere responses mein:

1. Clear explanation with examples
2. Code challenges in this exact format (IMPORTANT):
   \`\`\`challenge
   {
     "initialCode": "// Starter code here",
     "description": "Challenge description",
     "expectedOutput": "Expected output"
   }
   \`\`\`
3. Step-by-step teaching
4. Best practices and tips
5. Friendly and engaging tone
6. Interactive exercises

Current context: Topic: {topic} | Level: {level}`;

function extractCodeChallenge(text: string): CodeChallenge | undefined {
  const challengeMatch = text.match(/```challenge\n([\s\S]*?)```/);
  if (!challengeMatch) return undefined;

  try {
    const challenge = JSON.parse(challengeMatch[1]);
    return {
      initialCode: challenge.initialCode,
      description: challenge.description,
      expectedOutput: challenge.expectedOutput
    };
  } catch (error) {
    console.error('Failed to parse code challenge:', error);
    return undefined;
  }
}

export async function getAIResponse(
  messages: Message[],
  topic: string,
  level: string
): Promise<{ text: string; codeChallenge?: CodeChallenge }> {
  try {
    const history = messages.slice(-5).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.content,
    }));

    const chat = geminiModel.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const contextPrompt = SYSTEM_PROMPT
      .replace('{topic}', topic)
      .replace('{level}', level);

    const result = await chat.sendMessage(contextPrompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const codeChallenge = extractCodeChallenge(text);
    const cleanText = text.replace(/```challenge[\s\S]*?```/g, '');

    return { text: cleanText, codeChallenge };
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}