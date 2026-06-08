import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
    admin.initializeApp();
}

const GEMINI_MODEL = 'gemini-2.5-flash';
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

function getGeminiErrorDetails(error: unknown): { status?: number; message: string } {
    const message = error instanceof Error ? error.message : String(error);
    let status: number | undefined;

    if (error && typeof error === 'object' && 'status' in error) {
        const rawStatus = (error as { status?: unknown }).status;
        if (typeof rawStatus === 'number') {
            status = rawStatus;
        }
    }

    if (status === undefined) {
        const match = message.match(/\[(\d{3})\s/);
        if (match) {
            status = Number(match[1]);
        }
    }

    return { status, message };
}

function getErrorMessage(error: unknown): string {
    const { status, message } = getGeminiErrorDetails(error);

    if (message.includes('prepayment credits are depleted')) {
        return 'Gemini API credits are depleted. Add billing or credits in Google AI Studio, then try again.';
    }

    if (status === 429) {
        return 'Gemini rate limit reached. Wait a moment and try again.';
    }

    if (status === 404 && message.includes('no longer available')) {
        return 'The configured Gemini model is no longer available. Deploy the latest version of the app.';
    }

    if (status === 403 || message.toLowerCase().includes('api key')) {
        return 'Gemini API key is invalid or unauthorized. Check GEMINI_API_KEY in Firebase secrets.';
    }

    if (error instanceof SyntaxError) {
        return 'Gemini returned malformed JSON. Please try again.';
    }

    return 'Campaign generation failed. Please try again.';
}

function getErrorStatus(error: unknown): number {
    const { status, message } = getGeminiErrorDetails(error);

    if (status === 429 || message.includes('prepayment credits are depleted')) {
        return 429;
    }

    if (status === 403) {
        return 403;
    }

    return 500;
}

function setCorsHeaders(res: { set: (key: string, value: string) => void }) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export const generateCampaignApi = onRequest(
    {
        secrets: [geminiApiKey],
        cors: true,
        invoker: 'public',
        region: 'us-central1',
    },
    async (req, res) => {
        setCorsHeaders(res);

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthenticated' });
                return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            await admin.auth().verifyIdToken(idToken);

            const data = req.body as CampaignGenerationRequest;
            if (!data?.characterName?.trim() || !data?.characterClass?.trim()) {
                res.status(400).json({ error: 'Character name and class are required.' });
                return;
            }

            const apiKey = geminiApiKey.value();
            if (!apiKey) {
                res.status(412).json({ error: 'Gemini API key is not configured on the server.' });
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: GEMINI_MODEL,
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            });

            const result = await model.generateContent(buildPrompt({
                characterName: data.characterName.trim(),
                characterClass: data.characterClass.trim(),
            }));

            const text = result.response.text();
            if (!text) {
                res.status(500).json({ error: 'Gemini returned an empty campaign response.' });
                return;
            }

            const campaign = parseJsonResponse(text);
            res.status(200).json({ campaign });
        } catch (error) {
            console.error('Campaign generation failed:', error);
            res.status(getErrorStatus(error)).json({ error: getErrorMessage(error) });
        }
    },
);
