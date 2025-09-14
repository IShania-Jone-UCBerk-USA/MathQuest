import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Hint } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateMathQuestion(topic: string, theme: string, level: number, pastQuestions: string[]): Promise<Question | null> {
  try {
    const prompt = `Generate a math word problem for a child (ages 6-12).
    The topic is '${topic}'.
    The difficulty should be level ${level} out of 30 (1 is very easy, 30 is challenging).
    The word problem should fit the theme: '${theme}'.
    Word the problem in simple, encouraging language a child can easily understand.
    IMPORTANT: Do not generate a question with any of the following texts, as they have already been asked:
    ${pastQuestions.join('\n- ')}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: 'The full text of the word problem, worded for a child.'
                    },
                    answer: {
                        type: Type.NUMBER,
                        description: 'The final numerical answer to the problem. The answer must be a number.'
                    }
                },
                required: ["questionText", "answer"]
            },
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const jsonText = response.text.trim();
    if (jsonText) {
        const parsed = JSON.parse(jsonText);
        return parsed as Question;
    }
    return null;
  } catch (error: any) {
    console.error("Error generating math question:", error);
    if (error.toString().includes('429') || (error.error && error.error.status === 'RESOURCE_EXHAUSTED')) {
      throw new Error('RATE_LIMITED');
    }
    return null;
  }
}

export async function getTextHint(question: string, userAnswer:string, correctAnswer: number): Promise<string | null> {
    try {
        const prompt = `I'm a friendly robot in a kids math game. A child just answered a math problem incorrectly.
        Problem: "${question}"
        Their incorrect answer: ${userAnswer}
        The correct answer is: ${correctAnswer}

        Please provide a short, simple, step-by-step text hint to help them solve the problem.
        - Your tone must be very positive, cheerful, and encouraging. 
        - Start with a friendly phrase like "Good try!" or "Almost there!".
        - Analyze their specific incorrect answer and briefly explain what might have gone wrong in their thinking, then guide them to the correct method.
        - Do NOT reveal the final numerical answer. Just guide them on the steps to solve it.
        - Respond with ONLY the hint text. Keep it brief and easy for a child to read.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                // No JSON mode, just a fast text response.
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        return response.text.trim();
    } catch (error: any) {
        console.error("Error generating text hint:", error);
         if (error.toString().includes('429')) {
            return "Gigi's brain is working extra hard! Please wait a moment and try for a hint again.";
        }
        return "Oops! I had a little brain-freeze. Can you try solving it one more time?";
    }
}


export async function getSolution(question: string, userAnswer: string, correctAnswer: number): Promise<Hint | null> {
    try {
        const prompt = `I'm a character in a kids math game. A child just answered a math problem incorrectly.
        Problem: "${question}"
        Their answer: ${userAnswer}
        Correct answer: ${correctAnswer}
        
        Please provide a response in JSON format containing:
        1. 'textHint': A simple, step-by-step text explanation of how to solve the problem. Keep the tone very positive and encouraging. Analyze their specific incorrect answer '${userAnswer}' and use it in your step-by-step explanation of how to get to the correct answer '${correctAnswer}'.
        2. 'visualSolution': A self-contained, kid-friendly SVG graphic that visually explains the solution. The SVG should have a viewBox="0 0 300 150", use simple shapes, bright colors, and clear text. For example, for '2+3', it could show 2 colorful apples and 3 colorful apples, then 5 apples together. The final answer should be clearly visible in the graphic.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  textHint: {
                    type: Type.STRING,
                    description: "The friendly, encouraging text hint that guides the student based on their specific incorrect answer."
                  },
                  visualSolution: {
                    type: Type.STRING,
                    description: "A self-contained, kid-friendly SVG string (starting with <svg...>) that visually explains the problem's solution."
                  }
                },
                required: ["textHint", "visualSolution"]
              },
              thinkingConfig: { thinkingBudget: 0 },
            }
        });
        
        const jsonText = response.text.trim();
        if (jsonText) {
          return JSON.parse(jsonText) as Hint;
        }
        return null;
    } catch (error: any) {
        console.error("Error getting solution:", error);
        if (error.toString().includes('429')) {
             throw new Error('RATE_LIMITED');
        }
        return {
          textHint: "Oops! I'm having a little trouble thinking of a hint. The correct answer is " + correctAnswer,
          visualSolution: `<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg"><text x="150" y="75" font-family="Arial" font-size="20" fill="red" text-anchor="middle">Error generating visual.</text></svg>`
        };
    }
}