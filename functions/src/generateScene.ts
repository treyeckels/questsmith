import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
    admin.initializeApp();
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const geminiApiKey = defineSecret('GEMINI_API_KEY');

interface SceneGenerationRequest {
    campaignTitle: string;
    mainQuestHook: string;
    currentLocation: string;
    currentLocationDescription: string;
    currentObjective: string;
    character: {
        name: string;
        class: string;
        level: number;
        hp: number;
        maxHp: number;
    };
    selectedChoice: string | null;
    recentHistory: string[];
    npcs: Array<{ name: string; role: string }>;
    isOpeningScene: boolean;
}

function buildPrompt(input: SceneGenerationRequest): string {
    const sceneKind = input.isOpeningScene
        ? 'Generate the OPENING scene for this campaign. The hero has just arrived at the starting location. Set the stage with vivid narration and 2-4 meaningful first choices.'
        : `Generate the NEXT scene after the player chose: "${input.selectedChoice}"`;

    return `You are the Dungeon Master for QuestSmith, a cozy fantasy choose-your-own-adventure RPG.

${sceneKind}

Campaign context:
${JSON.stringify({
        campaignTitle: input.campaignTitle,
        mainQuestHook: input.mainQuestHook,
        currentLocation: input.currentLocation,
        currentLocationDescription: input.currentLocationDescription,
        currentObjective: input.currentObjective,
        character: input.character,
        npcs: input.npcs,
        recentHistory: input.recentHistory,
    }, null, 2)}

Instructions:
- Write engaging narrative text (2-4 short paragraphs max).
- Include NPC dialogue in the narrative when appropriate.
- Provide exactly 2-4 player choices with clear labels and intents.
- Tone: cozy fantasy, funny D&D chaos, YA adventure
- Do NOT modify HP, XP, gold, inventory, quest status, or location in your response.
- Do NOT resolve combat or dice rolls.
- Do NOT invent numerical stat changes.

Respond with ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "narrative": "string",
  "choices": [
    {
      "label": "string",
      "intent": "string",
      "riskLevel": "low | medium | high (optional)"
    }
  ]
}`;
}

function parseJsonResponse(raw: string): unknown {
    const trimmed = raw.trim();
    const jsonText = trimmed.startsWith('```')
        ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
        : trimmed;

    return JSON.parse(jsonText);
}

function setCorsHeaders(res: { set: (key: string, value: string) => void }) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export const generateScene = onRequest(
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

            const data = req.body as SceneGenerationRequest;
            if (!data?.campaignTitle?.trim() || !data?.currentLocation?.trim()) {
                res.status(400).json({ error: 'Campaign title and current location are required.' });
                return;
            }

            if (!data?.character?.name?.trim() || !data?.character?.class?.trim()) {
                res.status(400).json({ error: 'Character context is required.' });
                return;
            }

            if (!data.isOpeningScene && !data.selectedChoice?.trim()) {
                res.status(400).json({ error: 'Selected choice is required for scene continuation.' });
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
                ...data,
                campaignTitle: data.campaignTitle.trim(),
                currentLocation: data.currentLocation.trim(),
                recentHistory: Array.isArray(data.recentHistory) ? data.recentHistory : [],
                npcs: Array.isArray(data.npcs) ? data.npcs : [],
            }));

            const text = result.response.text();
            if (!text) {
                res.status(500).json({ error: 'Gemini returned an empty scene response.' });
                return;
            }

            const scene = parseJsonResponse(text);
            res.status(200).json({ scene });
        } catch (error) {
            console.error('Scene generation failed:', error);
            res.status(500).json({ error: 'Scene generation failed. Please try again.' });
        }
    },
);
