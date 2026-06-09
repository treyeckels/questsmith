import type { CampaignGenerationResponse, CombatNarrationResponse, ItemRewardGenerationResponse, SceneGenerationResponse } from './geminiTypes';
import type { InventoryItemType } from '../inventory/inventoryTypes';

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

export function validateSceneGenerationResponse(
    data: unknown,
    options: { isCampaignComplete?: boolean } = {},
): SceneGenerationResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Scene response was not a valid object.');
    }

    const response = data as Record<string, unknown>;

    if (!isNonEmptyString(response.narrative)) {
        throw new Error('Scene response is missing narrative text.');
    }

    if (!Array.isArray(response.choices)) {
        throw new Error('Scene response must include a choices array.');
    }

    if (options.isCampaignComplete) {
        if (response.choices.length !== 0) {
            throw new Error('Campaign completion scene must not include player choices.');
        }

        return {
            narrative: response.narrative.trim(),
            choices: [],
        };
    }

    if (response.choices.length < 2 || response.choices.length > 4) {
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

const ITEM_TYPES: InventoryItemType[] = ['weapon', 'armor', 'potion', 'quest', 'misc'];

function isItemType(value: unknown): value is InventoryItemType {
    return typeof value === 'string' && ITEM_TYPES.includes(value as InventoryItemType);
}

export function validateItemRewardGenerationResponse(data: unknown): ItemRewardGenerationResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Item reward response was not a valid object.');
    }

    const response = data as Record<string, unknown>;

    if (!isNonEmptyString(response.name)) {
        throw new Error('Item reward response is missing a name.');
    }

    if (!isNonEmptyString(response.description)) {
        throw new Error('Item reward response is missing a description.');
    }

    if (!isItemType(response.type)) {
        throw new Error('Item reward response has an invalid type.');
    }

    return {
        name: response.name.trim(),
        description: response.description.trim(),
        type: response.type,
    };
}

export function validateCombatNarrationResponse(data: unknown): CombatNarrationResponse {
    if (!data || typeof data !== 'object') {
        throw new Error('Combat narration response was not a valid object.');
    }

    const response = data as Record<string, unknown>;

    if (!isNonEmptyString(response.narrative)) {
        throw new Error('Combat narration response is missing narrative text.');
    }

    return {
        narrative: response.narrative.trim(),
    };
}
