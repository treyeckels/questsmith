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

export interface SceneGenerationCharacterContext {
    name: string;
    class: string;
    level: number;
    hp: number;
    maxHp: number;
}

export interface SceneGenerationNpcContext {
    name: string;
    role: string;
}

export type SceneCampaignPhase =
    | 'opening'
    | 'rising_action'
    | 'climax'
    | 'finale'
    | 'completed';

export interface SceneGenerationRequest {
    campaignTitle: string;
    mainQuestHook: string;
    currentLocation: string;
    currentLocationDescription: string;
    currentObjective: string;
    character: SceneGenerationCharacterContext;
    selectedChoice: string | null;
    recentHistory: string[];
    npcs: SceneGenerationNpcContext[];
    isOpeningScene: boolean;
    campaignPhase: SceneCampaignPhase;
    turnNumber: number;
    isFinale: boolean;
    isCampaignComplete: boolean;
}

export interface SceneGenerationChoiceResponse {
    label: string;
    intent: string;
    riskLevel?: 'low' | 'medium' | 'high';
}

export interface SceneGenerationResponse {
    narrative: string;
    choices: SceneGenerationChoiceResponse[];
}
