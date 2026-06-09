import type { SceneGenerationResponse } from '../gemini/geminiTypes';
import { requestSceneGeneration } from '../gemini/geminiService';
import { normalizeCampaignPhase } from '../campaign/campaignService';
import { getPhaseForTurn, shouldGenerateCompletionScene } from '../campaign/campaignPhase';
import { uniqueId } from '../../shared/utils/slugify';
import type { ActiveGame, Scene, SceneChoice, TurnDocument } from './gameTypes';
import {
    completeCampaign,
    getAllTurnRecords,
    getRecentTurnSummaries,
    saveTurnRecord,
    updateCampaignPhase,
    updateCurrentScene,
} from './gameService';

function getCurrentLocation(game: ActiveGame) {
    const location = game.campaign.locations.find(
        (entry) => entry.id === game.campaign.currentLocationId,
    );

    return {
        id: game.campaign.currentLocationId,
        name: location?.name ?? 'Unknown location',
        description: location?.description ?? '',
    };
}

function buildSceneRequest(
    game: ActiveGame,
    options: {
        selectedChoice: string | null;
        isOpeningScene: boolean;
        recentHistory: string[];
        turnNumber: number;
        isCampaignComplete: boolean;
    },
) {
    const location = getCurrentLocation(game);
    const campaign = normalizeCampaignPhase(game.campaign, options.turnNumber);
    const campaignPhase = options.isCampaignComplete ? 'completed' : campaign.phase;

    return {
        campaignTitle: campaign.title,
        mainQuestHook: campaign.mainQuestHook,
        currentLocation: location.name,
        currentLocationDescription: location.description,
        currentObjective: campaign.currentObjective,
        character: {
            name: game.character.name,
            class: game.character.class,
            level: game.character.level,
            hp: game.character.hp,
            maxHp: game.character.maxHp,
        },
        selectedChoice: options.selectedChoice,
        recentHistory: options.recentHistory,
        npcs: campaign.npcs.map((npc) => ({
            name: npc.name,
            role: npc.role,
        })),
        isOpeningScene: options.isOpeningScene,
        campaignPhase,
        turnNumber: options.turnNumber,
        isFinale: campaignPhase === 'finale' || options.isCampaignComplete,
        isCampaignComplete: options.isCampaignComplete,
    };
}

export function mapGeminiResponseToScene(
    response: SceneGenerationResponse,
    turnNumber: number,
    locationId: string,
    options: { isEndingScene?: boolean } = {},
): Scene {
    const choices: SceneChoice[] = response.choices.map((choice, index) => {
        const mapped: SceneChoice = {
            id: uniqueId('choice', choice.label, index),
            label: choice.label,
            intent: choice.intent,
        };

        if (choice.riskLevel) {
            mapped.riskLevel = choice.riskLevel;
        }

        return mapped;
    });

    const scene: Scene = {
        id: `scene-${turnNumber}-${Date.now()}`,
        turnNumber,
        locationId,
        narrative: response.narrative,
        choices,
    };

    if (options.isEndingScene) {
        scene.isEndingScene = true;
    }

    return scene;
}

function buildMajorEvents(turns: TurnDocument[]) {
    if (turns.length === 0) {
        return [];
    }

    const selectedTurns = turns.filter((turn, index) => (
        index === 0
        || index === turns.length - 1
        || index % 2 === 0
    )).slice(0, 6);

    return selectedTurns.map((turn) => ({
        turnNumber: turn.turnNumber,
        description: `${turn.selectedChoiceLabel}: ${turn.sceneSummary.slice(0, 140)}`,
    }));
}

export async function generateOpeningScene(game: ActiveGame): Promise<Scene> {
    const geminiResponse = await requestSceneGeneration(
        buildSceneRequest(game, {
            selectedChoice: null,
            isOpeningScene: true,
            recentHistory: [],
            turnNumber: 1,
            isCampaignComplete: false,
        }),
    );

    const location = getCurrentLocation(game);
    const scene = mapGeminiResponseToScene(geminiResponse, 1, location.id);
    const updatedCampaign = normalizeCampaignPhase(game.campaign, 1);

    await updateCampaignPhase(game.id, updatedCampaign);
    await updateCurrentScene(game.id, scene);
    return scene;
}

async function generateCompletionScene(
    game: ActiveGame,
    selectedChoice: SceneChoice,
    currentScene: Scene,
): Promise<Scene> {
    const recentHistory = await getRecentTurnSummaries(game.id, 5);
    const nextTurnNumber = currentScene.turnNumber + 1;

    const geminiResponse = await requestSceneGeneration(
        buildSceneRequest(game, {
            selectedChoice: `${selectedChoice.label} (${selectedChoice.intent})`,
            isOpeningScene: false,
            recentHistory,
            turnNumber: nextTurnNumber,
            isCampaignComplete: true,
        }),
    );

    const location = getCurrentLocation(game);
    const endingScene = mapGeminiResponseToScene(
        geminiResponse,
        nextTurnNumber,
        location.id,
        { isEndingScene: true },
    );

    const turnRecord: Omit<TurnDocument, 'createdAt'> = {
        turnNumber: currentScene.turnNumber,
        selectedChoiceId: selectedChoice.id,
        selectedChoiceLabel: selectedChoice.label,
        sceneSummary: geminiResponse.narrative.slice(0, 500),
        locationId: currentScene.locationId,
        events: [],
    };

    await saveTurnRecord(game.id, turnRecord);

    const allTurns = await getAllTurnRecords(game.id);
    const campaign = normalizeCampaignPhase(game.campaign, nextTurnNumber);
    const completedCampaign = {
        ...campaign,
        phase: 'completed' as const,
    };

    await completeCampaign(game.id, {
        campaign: completedCampaign,
        endingScene,
        completion: {
            title: campaign.title,
            mainObjective: campaign.currentObjective,
            startingLocationName: campaign.startingLocationName,
            endingNarrative: geminiResponse.narrative,
            turnsPlayed: allTurns.length,
            majorEvents: buildMajorEvents(allTurns),
        },
    });

    return endingScene;
}

export async function advanceStoryWithChoice(
    game: ActiveGame,
    choiceId: string,
): Promise<Scene> {
    const currentScene = game.currentScene;
    if (!currentScene) {
        throw new Error('There is no active scene to continue from.');
    }

    const selectedChoice = currentScene.choices.find((choice) => choice.id === choiceId);
    if (!selectedChoice) {
        throw new Error('That choice is no longer available.');
    }

    if (shouldGenerateCompletionScene(currentScene.turnNumber)) {
        return generateCompletionScene(game, selectedChoice, currentScene);
    }

    const recentHistory = await getRecentTurnSummaries(game.id, 5);
    const nextTurnNumber = currentScene.turnNumber + 1;

    const geminiResponse = await requestSceneGeneration(
        buildSceneRequest(game, {
            selectedChoice: `${selectedChoice.label} (${selectedChoice.intent})`,
            isOpeningScene: false,
            recentHistory,
            turnNumber: nextTurnNumber,
            isCampaignComplete: false,
        }),
    );

    const location = getCurrentLocation(game);
    const nextScene = mapGeminiResponseToScene(
        geminiResponse,
        nextTurnNumber,
        location.id,
    );

    const turnRecord: Omit<TurnDocument, 'createdAt'> = {
        turnNumber: currentScene.turnNumber,
        selectedChoiceId: selectedChoice.id,
        selectedChoiceLabel: selectedChoice.label,
        sceneSummary: geminiResponse.narrative.slice(0, 500),
        locationId: currentScene.locationId,
        events: [],
    };

    const updatedCampaign = normalizeCampaignPhase(game.campaign, nextTurnNumber);

    await saveTurnRecord(game.id, turnRecord);
    await updateCampaignPhase(game.id, updatedCampaign);
    await updateCurrentScene(game.id, nextScene);

    return nextScene;
}
