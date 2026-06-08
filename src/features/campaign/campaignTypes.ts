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
    locations: CampaignLocation[];
    npcs: CampaignNpc[];
}

export interface CampaignGenerationInput {
    characterName: string;
    characterClass: string;
}
