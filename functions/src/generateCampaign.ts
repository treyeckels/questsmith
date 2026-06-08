import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

interface CampaignGenerationRequest {
    characterName: string;
    characterClass: string;
}

function buildPrompt(input: CampaignGenerationRequest): string {
    return `You are the Dungeon Master for QuestSmith, a cozy fantasy choose-your-own-adventure RPG.

Generate a new campaign for this hero:
${JSON.stringify(input, null, 2)}

Requirements:
- Memorable campaign title
- A starting location name
- A main quest hook (1-2 sentences)
- A clear current objective for the hero
- 3-5 NPCs with name, role, and short description
- 5-10 locations with name and short description (include the starting location)
- Tone: cozy fantasy, funny D&D chaos, YA adventure

Respond with ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "title": "string",
  "mainQuestHook": "string",
  "startingLocation": "string",
  "currentObjective": "string",
  "npcs": [{ "name": "string", "role": "string", "description": "string" }],
  "locations": [{ "name": "string", "description": "string" }]
}`;
}

function parseJsonResponse(raw: string): unknown {
    const trimmed = raw.trim();
    const jsonText = trimmed.startsWith('```')
        ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
        : trimmed;

    return JSON.parse(jsonText);
}

export const generateCampaign = onCall(
    { secrets: [geminiApiKey] },
    async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be signed in to generate a campaign.');
    }

    const data = request.data as CampaignGenerationRequest;
    if (!data?.characterName?.trim() || !data?.characterClass?.trim()) {
        throw new HttpsError('invalid-argument', 'Character name and class are required.');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new HttpsError('failed-precondition', 'Gemini API key is not configured on the server.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const result = await model.generateContent(buildPrompt({
            characterName: data.characterName.trim(),
            characterClass: data.characterClass.trim(),
        }));

        const text = result.response.text();
        if (!text) {
            throw new HttpsError('internal', 'Gemini returned an empty campaign response.');
        }

        const campaign = parseJsonResponse(text);
        return { campaign };
    } catch (error) {
        if (error instanceof HttpsError) {
            throw error;
        }

        console.error('Campaign generation failed:', error);
        throw new HttpsError('internal', 'Campaign generation failed. Please try again.');
    }
    },
);
