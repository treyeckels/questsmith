import type { InventoryItemRarity, InventoryItemType } from '../inventory/inventoryTypes';

export interface ItemRewardGenerationRequest {
    campaignTitle: string;
    currentLocation: string;
    sceneNarrative: string;
    selectedChoice: string | null;
    characterName: string;
    characterClass: string;
    rarity: InventoryItemRarity;
}

export interface ItemRewardGenerationResponse {
    name: string;
    description: string;
    type: InventoryItemType;
}
