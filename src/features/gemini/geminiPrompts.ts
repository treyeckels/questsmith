import type { CampaignGenerationRequest } from './geminiTypes';

export const CAMPAIGN_TONE =
    'cozy fantasy, funny D&D chaos, YA adventure';

export function buildCampaignGenerationPrompt(input: CampaignGenerationRequest): string {
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
- Tone: ${CAMPAIGN_TONE}

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
