import firebase from 'firebase/compat/app';
import type { Campaign } from '../campaign/campaignTypes';
import type { Character } from '../character/characterTypes';
import type { InventoryItem } from '../inventory/inventoryTypes';

export type GameStatus = 'active' | 'completed' | 'defeated';

export type ChoiceRiskLevel = 'low' | 'medium' | 'high';

export interface SceneChoice {
    id: string;
    label: string;
    intent: string;
    riskLevel?: ChoiceRiskLevel;
}

export interface Scene {
    id: string;
    turnNumber: number;
    locationId: string;
    narrative: string;
    choices: SceneChoice[];
    isEndingScene?: boolean;
}

export interface CampaignCompletionRecord {
    title: string;
    mainObjective: string;
    startingLocationName: string;
    endingNarrative: string;
    turnsPlayed: number;
    majorEvents: Array<{
        turnNumber: number;
        description: string;
    }>;
    completedAt: firebase.firestore.Timestamp;
}

export type TurnEventType =
    | 'combat'
    | 'item_gain'
    | 'item_loss'
    | 'gold_change'
    | 'xp_gain'
    | 'quest_update'
    | 'location_change';

export interface TurnEvent {
    type: TurnEventType;
    description: string;
}

export interface TurnDocument {
    turnNumber: number;
    selectedChoiceId: string;
    selectedChoiceLabel: string;
    sceneSummary: string;
    locationId: string;
    events: TurnEvent[];
    createdAt: firebase.firestore.Timestamp;
}

export interface GameDocument {
    userId: string;
    status: GameStatus;
    createdAt: firebase.firestore.Timestamp;
    updatedAt: firebase.firestore.Timestamp;
    character: Character;
    campaign: Campaign | null;
    currentScene: Scene | null;
    campaignCompletion: CampaignCompletionRecord | null;
    inventory: InventoryItem[];
    quests: [];
}

export interface GameSummary {
    id: string;
    character: Character;
    campaign: Campaign | null;
    status: GameStatus;
    campaignCompletion: CampaignCompletionRecord | null;
    inventory: InventoryItem[];
}

export interface ActiveGame extends GameSummary {
    campaign: Campaign;
    currentScene: Scene | null;
}

export interface CompletedGame extends GameSummary {
    campaign: Campaign;
    campaignCompletion: CampaignCompletionRecord;
    status: 'completed';
}
