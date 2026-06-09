import firebase from 'firebase/compat/app';
import { db } from '../../firebase';
import { COLLECTIONS } from '../../shared/firebase/firestorePaths';
import { uniqueId } from '../../shared/utils/slugify';
import { CAMPAIGN_TONE } from '../gemini/geminiPrompts';
import { requestCampaignGeneration } from '../gemini/geminiService';
import type { CampaignGenerationResponse } from '../gemini/geminiTypes';
import type { Campaign, CampaignGenerationInput, CampaignPhase } from './campaignTypes';
import type { GameDocument } from '../game/gameTypes';
import { getPhaseForTurn } from './campaignPhase';

function findStartingLocationId(
    startingLocationName: string,
    locations: Campaign['locations'],
): string {
    const normalizedStart = startingLocationName.toLowerCase().trim();
    const exactMatch = locations.find(
        (location) => location.name.toLowerCase().trim() === normalizedStart,
    );

    if (exactMatch) {
        return exactMatch.id;
    }

    const partialMatch = locations.find((location) =>
        location.name.toLowerCase().includes(normalizedStart)
        || normalizedStart.includes(location.name.toLowerCase()),
    );

    return partialMatch?.id ?? locations[0]?.id ?? 'location-0';
}

export function mapGeminiResponseToCampaign(response: CampaignGenerationResponse): Campaign {
    const locations = response.locations.map((location, index) => ({
        id: uniqueId('location', location.name, index),
        name: location.name,
        description: location.description,
        unlocked: false,
    }));

    const startingLocationId = findStartingLocationId(response.startingLocation, locations);

    const locationsWithStart = locations.map((location) => ({
        ...location,
        unlocked: location.id === startingLocationId,
    }));

    const npcs = response.npcs.map((npc, index) => ({
        id: uniqueId('npc', npc.name, index),
        name: npc.name,
        role: npc.role,
        description: npc.description,
    }));

    const startingLocation = locationsWithStart.find((location) => location.id === startingLocationId);

    return {
        title: response.title,
        tone: CAMPAIGN_TONE,
        mainQuestHook: response.mainQuestHook,
        currentObjective: response.currentObjective,
        currentLocationId: startingLocationId,
        startingLocationName: startingLocation?.name ?? response.startingLocation,
        phase: 'opening' as CampaignPhase,
        locations: locationsWithStart,
        npcs,
    };
}

export function normalizeCampaignPhase(campaign: Campaign, turnNumber: number): Campaign {
    const startingLocation = campaign.locations.find(
        (location) => location.id === campaign.currentLocationId,
    );

    return {
        ...campaign,
        startingLocationName: campaign.startingLocationName
            ?? startingLocation?.name
            ?? 'Unknown location',
        phase: campaign.phase === 'completed' ? 'completed' : getPhaseForTurn(turnNumber),
    };
}

export async function saveCampaignToGame(gameId: string, campaign: Campaign): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        campaign,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function generateAndSaveCampaign(
    gameId: string,
    input: CampaignGenerationInput,
): Promise<Campaign> {
    const geminiResponse = await requestCampaignGeneration({
        characterName: input.characterName,
        characterClass: input.characterClass,
    });

    const campaign = mapGeminiResponseToCampaign(geminiResponse);
    await saveCampaignToGame(gameId, campaign);
    return campaign;
}

export async function startNewAdventure(
    gameId: string,
    input: CampaignGenerationInput,
    options: { restoreHealth?: boolean } = {},
): Promise<Campaign> {
    const gameDoc = await db.collection(COLLECTIONS.games).doc(gameId).get();
    const data = gameDoc.data() as GameDocument | undefined;

    const updatePayload: Record<string, unknown> = {
        status: 'active',
        campaign: null,
        currentScene: null,
        combatState: null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (options.restoreHealth && data?.character) {
        updatePayload.character = {
            ...data.character,
            hp: data.character.maxHp,
        };
    }

    await db.collection(COLLECTIONS.games).doc(gameId).update(updatePayload);

    return generateAndSaveCampaign(gameId, input);
}
