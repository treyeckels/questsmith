import type { CampaignGenerationRequest, SceneGenerationRequest } from './geminiTypes';

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

export function buildSceneGenerationPrompt(input: SceneGenerationRequest): string {
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
- Tone: ${CAMPAIGN_TONE}
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
