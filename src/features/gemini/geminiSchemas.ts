import type { CampaignGenerationResponse, SceneGenerationResponse } from './geminiTypes';

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNpc(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const npc = value as Record<string, unknown>;
    return isNonEmptyString(npc.name) && isNonEmptyString(npc.role) && isNonEmptyString(npc.description);
}

function isLocation(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const location = value as Record<string, unknown>;
    return isNonEmptyString(location.name) && isNonEmptyString(location.description);
}

export function validateCampaignGenerationResponse(data: unknown): CampaignGenerationResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Campaign response was not a valid object.');
    }

    const response = data as Record<string, unknown>;

    if (!isNonEmptyString(response.title)) {
        throw new Error('Campaign response is missing a title.');
    }
    if (!isNonEmptyString(response.mainQuestHook)) {
        throw new Error('Campaign response is missing a main quest hook.');
    }
    if (!isNonEmptyString(response.startingLocation)) {
        throw new Error('Campaign response is missing a starting location.');
    }
    if (!isNonEmptyString(response.currentObjective)) {
        throw new Error('Campaign response is missing a current objective.');
    }
    if (!Array.isArray(response.npcs) || response.npcs.length < 3 || !response.npcs.every(isNpc)) {
        throw new Error('Campaign response must include 3-5 valid NPCs.');
    }
    if (!Array.isArray(response.locations) || response.locations.length < 5 || !response.locations.every(isLocation)) {
        throw new Error('Campaign response must include 5-10 valid locations.');
    }

    return {
        title: response.title.trim(),
        mainQuestHook: response.mainQuestHook.trim(),
        startingLocation: response.startingLocation.trim(),
        currentObjective: response.currentObjective.trim(),
        npcs: response.npcs.map((npc) => {
            const entry = npc as Record<string, string>;
            return {
                name: entry.name.trim(),
                role: entry.role.trim(),
                description: entry.description.trim(),
            };
        }),
        locations: response.locations.map((location) => {
            const entry = location as Record<string, string>;
            return {
                name: entry.name.trim(),
                description: entry.description.trim(),
            };
        }),
    };
}

export function parseCampaignGenerationJson(raw: string): CampaignGenerationResponse {
    const trimmed = raw.trim();
    const jsonText = trimmed.startsWith('```')
        ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
        : trimmed;

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        throw new Error('Campaign response was not valid JSON.');
    }

    return validateCampaignGenerationResponse(parsed);
}

function isRiskLevel(value: unknown): value is 'low' | 'medium' | 'high' {
    return value === 'low' || value === 'medium' || value === 'high';
}

function isSceneChoice(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const choice = value as Record<string, unknown>;
    return isNonEmptyString(choice.label) && isNonEmptyString(choice.intent)
        && (choice.riskLevel === undefined || isRiskLevel(choice.riskLevel));
}

export function validateSceneGenerationResponse(data: unknown): SceneGenerationResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Scene response was not a valid object.');
    }

    const response = data as Record<string, unknown>;

    if (!isNonEmptyString(response.narrative)) {
        throw new Error('Scene response is missing narrative text.');
    }

    if (!Array.isArray(response.choices) || response.choices.length < 2 || response.choices.length > 4) {
        throw new Error('Scene response must include 2-4 choices.');
    }

    if (!response.choices.every(isSceneChoice)) {
        throw new Error('Scene response contains invalid choices.');
    }

    return {
        narrative: response.narrative.trim(),
        choices: response.choices.map((choice) => {
            const entry = choice as Record<string, unknown>;
            const mapped: SceneGenerationResponse['choices'][number] = {
                label: String(entry.label).trim(),
                intent: String(entry.intent).trim(),
            };
            if (isRiskLevel(entry.riskLevel)) {
                mapped.riskLevel = entry.riskLevel;
            }
            return mapped;
        }),
    };
}
