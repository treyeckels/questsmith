export interface CampaignGenerationRequest {
    characterName: string;
    characterClass: string;
}

export interface CampaignGenerationNpcResponse {
    name: string;
    role: string;
    description: string;
}

export interface CampaignGenerationLocationResponse {
    name: string;
    description: string;
}

export interface CampaignGenerationResponse {
    title: string;
    mainQuestHook: string;
    startingLocation: string;
    currentObjective: string;
    npcs: CampaignGenerationNpcResponse[];
    locations: CampaignGenerationLocationResponse[];
}
