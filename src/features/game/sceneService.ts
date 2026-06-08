import firebase from 'firebase/compat/app';
import type { SceneGenerationResponse } from '../gemini/geminiTypes';
import { requestSceneGeneration } from '../gemini/geminiService';
import { uniqueId } from '../../shared/utils/slugify';
import type { ActiveGame, Scene, SceneChoice, TurnDocument } from './gameTypes';
import { getRecentTurnSummaries, saveTurnRecord, updateCurrentScene } from './gameService';

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
    },
) {
    const location = getCurrentLocation(game);

    return {
        campaignTitle: game.campaign.title,
        mainQuestHook: game.campaign.mainQuestHook,
        currentLocation: location.name,
        currentLocationDescription: location.description,
        currentObjective: game.campaign.currentObjective,
        character: {
            name: game.character.name,
            class: game.character.class,
            level: game.character.level,
            hp: game.character.hp,
            maxHp: game.character.maxHp,
        },
        selectedChoice: options.selectedChoice,
        recentHistory: options.recentHistory,
        npcs: game.campaign.npcs.map((npc) => ({
            name: npc.name,
            role: npc.role,
        })),
        isOpeningScene: options.isOpeningScene,
    };
}

export function mapGeminiResponseToScene(
    response: SceneGenerationResponse,
    turnNumber: number,
    locationId: string,
): Scene {
    const choices: SceneChoice[] = response.choices.map((choice, index) => ({
        id: uniqueId('choice', choice.label, index),
        label: choice.label,
        intent: choice.intent,
        riskLevel: choice.riskLevel,
    }));

    return {
        id: `scene-${turnNumber}-${Date.now()}`,
        turnNumber,
        locationId,
        narrative: response.narrative,
        choices,
    };
}

export async function generateOpeningScene(game: ActiveGame): Promise<Scene> {
    const geminiResponse = await requestSceneGeneration(
        buildSceneRequest(game, {
            selectedChoice: null,
            isOpeningScene: true,
            recentHistory: [],
        }),
    );

    const location = getCurrentLocation(game);
    const scene = mapGeminiResponseToScene(geminiResponse, 1, location.id);
    await updateCurrentScene(game.id, scene);
    return scene;
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

    const recentHistory = await getRecentTurnSummaries(game.id, 5);
    const geminiResponse = await requestSceneGeneration(
        buildSceneRequest(game, {
            selectedChoice: `${selectedChoice.label} (${selectedChoice.intent})`,
            isOpeningScene: false,
            recentHistory,
        }),
    );

    const location = getCurrentLocation(game);
    const nextScene = mapGeminiResponseToScene(
        geminiResponse,
        currentScene.turnNumber + 1,
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

    await saveTurnRecord(game.id, turnRecord);
    await updateCurrentScene(game.id, nextScene);

    return nextScene;
}
