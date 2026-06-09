import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
    admin.initializeApp();
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const geminiApiKey = defineSecret('GEMINI_API_KEY');

interface ItemRewardGenerationRequest {
    campaignTitle: string;
    currentLocation: string;
    sceneNarrative: string;
    selectedChoice: string | null;
    characterName: string;
    characterClass: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

function buildPrompt(input: ItemRewardGenerationRequest): string {
    return `You are the Dungeon Master for QuestSmith, a cozy fantasy choose-your-own-adventure RPG.

Generate a flavorful item discovery for this story moment.

Context:
${JSON.stringify({
        campaignTitle: input.campaignTitle,
        currentLocation: input.currentLocation,
        sceneNarrative: input.sceneNarrative,
        selectedChoice: input.selectedChoice,
        characterName: input.characterName,
        characterClass: input.characterClass,
        rarity: input.rarity,
    }, null, 2)}

Instructions:
- Create a memorable item name and short fantasy description (1-2 sentences).
- The item rarity is ${input.rarity}. Match the tone and grandeur to that rarity.
- Choose an item type: weapon, armor, potion, quest, or misc.
- Tone: cozy fantasy, funny D&D chaos, YA adventure.
- Do NOT include stat bonuses, mechanics, prices, or inventory changes.
- Do NOT reference updating game state.

Respond with ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "name": "string",
  "description": "string",
  "type": "weapon | armor | potion | quest | misc"
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

export const generateItemReward = onRequest(
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

            const data = req.body as ItemRewardGenerationRequest;
            if (!data?.campaignTitle?.trim() || !data?.currentLocation?.trim()) {
                res.status(400).json({ error: 'Campaign title and current location are required.' });
                return;
            }

            if (!data?.sceneNarrative?.trim()) {
                res.status(400).json({ error: 'Scene narrative is required.' });
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
                sceneNarrative: data.sceneNarrative.trim(),
                characterName: data.characterName?.trim() ?? 'Hero',
                characterClass: data.characterClass?.trim() ?? 'adventurer',
                rarity: data.rarity ?? 'common',
            }));

            const text = result.response.text();
            if (!text) {
                res.status(500).json({ error: 'Gemini returned an empty item response.' });
                return;
            }

            const item = parseJsonResponse(text);
            res.status(200).json({ item });
        } catch (error) {
            console.error('Item reward generation failed:', error);
            res.status(500).json({ error: 'Item reward generation failed. Please try again.' });
        }
    },
);
