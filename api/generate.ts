import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        res.status(500).json({ error: "The API_KEY environment variable is not set on the server." });
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { prompt, schema, useGoogleSearch } = req.body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modelConfig: any = {
            temperature: 0.2, // Lower temperature for more factual, grounded responses
        };

        if (useGoogleSearch) {
            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required for Google Search grounding' });
            }
            modelConfig.tools = [{googleSearch: {}}];
        } else {
            if (!prompt || !schema) {
                return res.status(400).json({ error: 'Prompt and schema are required for non-search requests' });
            }
            modelConfig.responseMimeType = "application/json";
            modelConfig.responseSchema = schema;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: modelConfig,
        });
        
        const rawText = response.text;

        try {
            // The AI should return a valid JSON string.
            // We'll trim it and handle potential markdown code blocks just in case.
            const cleanedText = rawText.replace(/^```(json)?\s*|```\s*$/g, '').trim();
            const jsonResponse = JSON.parse(cleanedText);
            res.status(200).json(jsonResponse);
        } catch (parseError) {
            console.error("Failed to parse extracted JSON string.", {
                originalText: rawText,
                parseError,
            });
            throw new Error("Failed to parse the JSON response from the AI model.");
        }

    } catch (error) {
        console.error("Gemini API call failed via proxy:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from Gemini API";
        res.status(500).json({ error: errorMessage });
    }
}