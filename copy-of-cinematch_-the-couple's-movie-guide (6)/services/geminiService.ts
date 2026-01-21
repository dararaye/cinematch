import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from "../types";

const getApiKey = () => {
  // @ts-ignore
  const key = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
  if (!key) {
    console.error("CRITICAL: VITE_API_KEY is missing from environment variables.");
  }
  return key || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const MOVIE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      year: { type: Type.NUMBER },
      conversationalSynopsis: { 
        type: Type.STRING, 
        description: "A short synopsis written like one partner explaining it to another. Mention lead actors, the director's vibe, and why it's cool." 
      },
      posterUrl: { type: Type.STRING },
      rottenTomatoesScore: { type: Type.STRING },
      trailerUrl: { type: Type.STRING },
      genres: { type: Type.ARRAY, items: { type: Type.STRING } },
      cast: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 lead actors" },
      runtime: { type: Type.STRING, description: "e.g. 1h 45m" },
      streamingPlatforms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["name", "type"]
        }
      }
    },
    required: ["id", "title", "year", "conversationalSynopsis", "posterUrl", "rottenTomatoesScore", "streamingPlatforms", "cast", "runtime"]
  }
};

export async function fetchMovies(preferences: {
  mood: string;
  yearRange: string;
  maxRuntime: string;
  platforms: string[];
  seenIds: string[];
  dislikedIds: string[];
}): Promise<Movie[]> {
  const platformList = preferences.platforms.join(', ');
  
  const timeframes: Record<string, string> = {
    '1w': 'released in the last week',
    '1m': 'released in the last month',
    '3m': 'released in the last 3 months',
    '6m': 'released in the last 6 months',
    '1y': 'released in the last year',
    '2y': 'released in the last 2 years',
    '5y': 'released in the last 5 years',
    '10y': 'released in the last 10 years',
  };

  const timeframeText = timeframes[preferences.yearRange] || 'released in the last 10 years';
  const moodText = preferences.mood !== 'Any Mood' ? `with a "${preferences.mood}" vibe` : '';
  const runtimeText = preferences.maxRuntime !== 'Any' ? `and a runtime of ${preferences.maxRuntime}` : '';

  const prompt = `
    Dara and Ari are looking for a movie. Find 12 movies ${timeframeText} ${moodText} ${runtimeText}.
    CRITICAL: Availability must be confirmed for: ${platformList}.
    Exclude these IDs: ${preferences.seenIds.slice(0, 30).join(', ')}.
    Include Rotten Tomatoes scores and streaming types (subscription/free/rent).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA,
        tools: [{ googleSearch: {} }]
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}