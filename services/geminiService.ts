
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, GradingResult } from '../types';

// Initialize the client with strict process.env.API_KEY usage
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to convert file to base64 for Gemini
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Robust Mock Data Generator
const getMockQuestions = (topic: string, count: number): Question[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId(),
    stem: i === count - 1 
      ? `(Mock Theory) Explain the primary implications of ${topic} in a modern context.`
      : `(Mock Mode) What is a key concept in ${topic} related to question #${i + 1}?`,
    type: i === count - 1 ? QuestionType.ESSAY : QuestionType.MCQ,
    options: i === count - 1 ? [] : [
      { id: 'a', text: 'The fundamental theorem of calculus' },
      { id: 'b', text: 'Mitochondrial DNA replication' },
      { id: 'c', text: 'Supply and Demand curves' },
      { id: 'd', text: 'The hero journey archetype' }
    ],
    correctOptionId: i === count - 1 ? '' : ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)],
    explanation: 'This is a simulated explanation. In production, check your API key permissions.',
    vignette: i % 3 === 0 ? `A detailed case study regarding ${topic} serves as the context for this question.` : undefined,
    difficulty: 0.5,
    topic: topic,
    rubric: i === count - 1 ? "Look for keywords: integration, synthesis, and specific examples." : undefined
  }));
};

export const generateQuizQuestions = async (
  topic: string, 
  count: number, 
  difficulty: string,
  userContext: { level: string, field: string },
  contextText?: string
): Promise<Question[]> => {
  
  const modelId = 'gemini-2.5-flash';
  const mcqCount = Math.max(1, count - 1);
  
  // Constructing the prompt with User Context
  const contextString = `
    TARGET AUDIENCE: ${userContext.level} student specializing in ${userContext.field}.
    Tone: Academic, rigorous, and appropriate for this education level.
  `;

  let prompt = "";
  
  if (contextText) {
    prompt = `You are an expert examiner. Create a ${count}-question exam about "${topic}" based on the source text.
    ${contextString}
    SOURCE TEXT: ${contextText.substring(0, 30000)}...
    Generate ${mcqCount} Multiple Choice Questions and 1 Complex Theory Question (Essay).
    Difficulty: ${difficulty}.`;
  } else {
    prompt = `Generate a ${count}-question exam about "${topic}". 
    ${contextString}
    Include ${mcqCount} Multiple Choice Questions and 1 Theory Question (Essay type) at the end.
    Difficulty: ${difficulty}.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert exam creator. Return strictly valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stem: { type: Type.STRING, description: "The question text" },
              type: { type: Type.STRING, enum: ["MCQ", "ESSAY"] },
              vignette: { type: Type.STRING, description: "Optional context/story", nullable: true },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING }
                  }
                },
                nullable: true
              },
              correctOptionId: { type: Type.STRING, nullable: true },
              explanation: { type: Type.STRING, description: "Explanation for MCQs or Grading Rubric for Essays." },
              difficulty: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    if (response.text) {
      const rawQuestions = JSON.parse(response.text);
      return rawQuestions.map((q: any) => ({
        ...q,
        id: generateId(),
        type: q.type === 'ESSAY' ? QuestionType.ESSAY : QuestionType.MCQ,
        options: q.options || [], // Ensure options is array even if null
        topic: topic,
        // If it's an essay, the 'explanation' from AI serves as the 'rubric'
        rubric: q.type === 'ESSAY' ? q.explanation : undefined
      }));
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.warn("Gemini API Error (Falling back to Offline Mode):", error);
    return getMockQuestions(topic, count);
  }
};

export const gradeHandwrittenEssay = async (
  imageFile: File,
  questionStem: string,
  rubric?: string
): Promise<GradingResult> => {
  
  const modelId = 'gemini-2.5-flash';
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `Grade this handwritten answer for the question: "${questionStem}".
  Rubric/Context: ${rubric || 'Grade based on clarity, accuracy, and depth.'}
  
  Return a JSON object with:
  - handwriting_transcription (string)
  - is_legible (boolean)
  - score_out_of_100 (number)
  - key_strengths (array of strings)
  - areas_for_improvement (array of strings)
  - corrected_version (string)
  - feedback_summary (string)`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
               handwriting_transcription: { type: Type.STRING },
               is_legible: { type: Type.BOOLEAN },
               score_out_of_100: { type: Type.NUMBER },
               key_strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
               areas_for_improvement: { type: Type.ARRAY, items: { type: Type.STRING } },
               corrected_version: { type: Type.STRING },
               feedback_summary: { type: Type.STRING }
           }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("No grading response");
  } catch (error) {
      console.error("Grading failed", error);
      return {
          handwriting_transcription: "Error processing image.",
          is_legible: false,
          score_out_of_100: 0,
          key_strengths: [],
          areas_for_improvement: ["Could not analyze image."],
          corrected_version: "",
          feedback_summary: "AI service unavailable."
      };
  }
};
