import type { CharacterClass } from '../character/characterTypes';
import type { InventoryItemRarity, InventoryItemType } from '../inventory/inventoryTypes';

export type AuthMethod = 'email' | 'google';

export type ItemAcquisitionSource = 'story' | 'combat';

export type CombatResult = 'victory' | 'defeat';

export interface LoginEventParams {
    auth_method: AuthMethod;
}

export interface SignUpEventParams {
    auth_method: AuthMethod;
}

export interface CharacterCreatedEventParams {
    character_class: CharacterClass;
    campaign_id: string;
}

export interface CampaignStartedEventParams {
    campaign_id: string;
    character_class: CharacterClass;
    is_new_adventure: boolean;
}

export interface StoryTurnCompletedEventParams {
    campaign_id: string;
    turn_number: number;
    campaign_phase: string;
}

export interface ItemAcquiredEventParams {
    campaign_id: string;
    item_type: InventoryItemType;
    item_rarity: InventoryItemRarity;
    source: ItemAcquisitionSource;
    turn_number: number;
}

export interface CombatStartedEventParams {
    campaign_id: string;
    enemy_id: string;
    turn_number: number;
}

export interface CombatCompletedEventParams {
    campaign_id: string;
    enemy_id: string;
    combat_result: CombatResult;
    turn_number: number;
}

export interface CampaignCompletedEventParams {
    campaign_id: string;
    turns_played: number;
}

export type AnalyticsEventParams =
    | LoginEventParams
    | SignUpEventParams
    | CharacterCreatedEventParams
    | CampaignStartedEventParams
    | StoryTurnCompletedEventParams
    | ItemAcquiredEventParams
    | CombatStartedEventParams
    | CombatCompletedEventParams
    | CampaignCompletedEventParams
    | { screen_name: string };
