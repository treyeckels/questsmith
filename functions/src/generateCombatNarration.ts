import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
    admin.initializeApp();
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const geminiApiKey = defineSecret('GEMINI_API_KEY');

interface CombatNarrationRequest {
    enemy: string;
    roll: number;
    attackModifier: number;
    damage: number;
    outcome: 'hit' | 'miss';
    enemyRoll?: number | null;
    enemyDamage?: number;
    enemyOutcome?: 'hit' | 'miss' | null;
}

function buildPrompt(input: CombatNarrationRequest): string {
    return `You are the Dungeon Master for QuestSmith, a cozy fantasy choose-your-own-adventure RPG.

Narrate the combat result using the exact numbers provided. Do not invent damage, rolls, or outcomes.

Context:
${JSON.stringify({
        enemy: input.enemy,
        roll: input.roll,
        attackModifier: input.attackModifier,
        damage: input.damage,
        outcome: input.outcome,
        enemyRoll: input.enemyRoll ?? null,
        enemyDamage: input.enemyDamage ?? 0,
        enemyOutcome: input.enemyOutcome ?? null,
    }, null, 2)}

Instructions:
- Narrate the player's attack result in 1-3 sentences.
- If enemy counterattack data is provided, briefly mention it.
- Tone: cozy fantasy, funny D&D chaos, YA adventure.
- Do NOT alter numerical values.
- Do NOT invent additional combat outcomes.

Respond with ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "narrative": "string"
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

export const generateCombatNarration = onRequest(
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
            res.status(405).json({ error: 'Method not allowed.' });
            return;
        }

        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization.' });
            return;
        }

        try {
            await admin.auth().verifyIdToken(authHeader.slice(7));
        } catch {
            res.status(401).json({ error: 'Invalid authentication token.' });
            return;
        }

        const body = req.body as CombatNarrationRequest;
        if (
            !body?.enemy
            || typeof body.roll !== 'number'
            || typeof body.attackModifier !== 'number'
            || typeof body.damage !== 'number'
            || (body.outcome !== 'hit' && body.outcome !== 'miss')
        ) {
            res.status(400).json({ error: 'Invalid combat narration request.' });
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey.value());
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            const result = await model.generateContent(buildPrompt(body));
            const raw = result.response.text();
            const parsed = parseJsonResponse(raw) as { narrative?: string };

            if (!parsed?.narrative?.trim()) {
                res.status(502).json({ error: 'Combat narration response was empty.' });
                return;
            }

            res.status(200).json({
                narration: {
                    narrative: parsed.narrative.trim(),
                },
            });
        } catch (error) {
            console.error('generateCombatNarration failed:', error);
            res.status(500).json({ error: 'Combat narration generation failed.' });
        }
    },
);
