import firebase from 'firebase/compat/app';
import type { ActiveGame } from '../game/gameTypes';
import { requestItemRewardGeneration } from '../gemini/geminiService';
import { createInventoryItem } from '../inventory/inventoryService';
import type { InventoryItem, InventoryItemRarity } from '../inventory/inventoryTypes';
import { uniqueId } from '../../shared/utils/slugify';
import {
    MIN_REWARD_TURN,
    MIN_TURNS_BETWEEN_REWARDS,
    RARITY_WEIGHTS,
    REWARD_CHANCE_PER_TURN,
} from './rewardConfig';

export function rollItemRarity(): InventoryItemRarity {
    const entries = Object.entries(RARITY_WEIGHTS) as Array<[InventoryItemRarity, number]>;
    const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * totalWeight;

    for (const [rarity, weight] of entries) {
        roll -= weight;
        if (roll <= 0) {
            return rarity;
        }
    }

    return 'common';
}

export function shouldAwardItemReward(
    turnNumber: number,
    lastRewardTurn: number | null,
    options: { isCampaignComplete?: boolean } = {},
): boolean {
    if (options.isCampaignComplete) {
        return false;
    }

    if (turnNumber < MIN_REWARD_TURN) {
        return false;
    }

    const turnsSinceLastReward = lastRewardTurn === null
        ? turnNumber
        : turnNumber - lastRewardTurn;

    if (turnsSinceLastReward < MIN_TURNS_BETWEEN_REWARDS) {
        return false;
    }

    return Math.random() < REWARD_CHANCE_PER_TURN;
}

export async function generateItemReward(
    game: ActiveGame,
    options: {
        turnNumber: number;
        sceneNarrative: string;
        selectedChoice: string | null;
    },
): Promise<InventoryItem> {
    const location = game.campaign.locations.find(
        (entry) => entry.id === game.campaign.currentLocationId,
    );
    const rarity = rollItemRarity();

    const geminiResponse = await requestItemRewardGeneration({
        campaignTitle: game.campaign.title,
        currentLocation: location?.name ?? 'Unknown location',
        sceneNarrative: options.sceneNarrative,
        selectedChoice: options.selectedChoice,
        characterName: game.character.name,
        characterClass: game.character.class,
        rarity,
    });

    return createInventoryItem({
        id: uniqueId('item', geminiResponse.name, options.turnNumber),
        name: geminiResponse.name,
        description: geminiResponse.description,
        type: geminiResponse.type,
        rarity,
        acquiredAt: firebase.firestore.Timestamp.now(),
    });
}

export async function tryAwardItemReward(
    game: ActiveGame,
    options: {
        turnNumber: number;
        sceneNarrative: string;
        selectedChoice: string | null;
        isCampaignComplete?: boolean;
    },
): Promise<InventoryItem | null> {
    if (!shouldAwardItemReward(options.turnNumber, game.lastItemRewardTurn ?? null, options)) {
        return null;
    }

    try {
        return await generateItemReward(game, options);
    } catch (error) {
        console.warn('Item reward generation failed; continuing without reward.', error);
        return null;
    }
}
