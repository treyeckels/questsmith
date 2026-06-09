export type CampaignPhase =
    | 'opening'
    | 'rising_action'
    | 'climax'
    | 'finale'
    | 'completed';

export interface CampaignLocation {
    id: string;
    name: string;
    description: string;
    imageId?: string;
    mapX?: number;
    mapY?: number;
    unlocked: boolean;
}

export interface CampaignNpc {
    id: string;
    name: string;
    role: string;
    description: string;
}

export interface Campaign {
    title: string;
    tone: string;
    mainQuestHook: string;
    currentObjective: string;
    currentLocationId: string;
    startingLocationName: string;
    phase: CampaignPhase;
    locations: CampaignLocation[];
    npcs: CampaignNpc[];
}

export interface CampaignSummary {
    title: string;
    mainObjective: string;
    startingLocationName: string;
    turnsPlayed: number;
    majorEvents: Array<{
        turnNumber: number;
        description: string;
    }>;
    endingNarrative: string;
}

export interface CampaignGenerationInput {
    characterName: string;
    characterClass: string;
}
