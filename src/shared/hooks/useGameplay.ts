import { useCallback, useEffect, useRef, useState } from 'react';
import { getPhaseForTurn } from '../../features/campaign/campaignPhase';
import type { ActiveGame, Scene } from '../../features/game/gameTypes';
import { getActiveGameForPlay } from '../../features/game/gameService';
import { advanceStoryWithChoice, generateOpeningScene } from '../../features/game/sceneService';
import { addItemToInventory } from '../../features/inventory/inventoryService';
import type { InventoryItem } from '../../features/inventory/inventoryTypes';

type GameplayStatus = 'loading' | 'ready' | 'generating' | 'processing' | 'completed' | 'error';

function applyRewardToGame(game: ActiveGame, item: InventoryItem, turnNumber: number): ActiveGame {
    return {
        ...game,
        inventory: addItemToInventory(game.inventory, item),
        lastItemRewardTurn: turnNumber,
    };
}

export function useGameplay(userId: string | undefined) {
    const [game, setGame] = useState<ActiveGame | null>(null);
    const [status, setStatus] = useState<GameplayStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [pendingReward, setPendingReward] = useState<InventoryItem | null>(null);
    const bootstrappedRef = useRef(false);

    const handleSceneAdvance = useCallback((activeGame: ActiveGame, scene: Scene, awardedItem: InventoryItem | null) => {
        let nextGame: ActiveGame = {
            ...activeGame,
            currentScene: scene,
            campaign: {
                ...activeGame.campaign,
                phase: scene.isEndingScene ? 'completed' : getPhaseForTurn(scene.turnNumber),
            },
        };

        if (awardedItem) {
            nextGame = applyRewardToGame(nextGame, awardedItem, scene.turnNumber);
            setPendingReward(awardedItem);
        }

        setGame(nextGame);
        return nextGame;
    }, []);

    const bootstrapOpeningScene = useCallback(async (activeGame: ActiveGame) => {
        setStatus('generating');
        setError(null);
        const result = await generateOpeningScene(activeGame);
        handleSceneAdvance(activeGame, result.scene, result.awardedItem);
        setStatus('ready');
    }, [handleSceneAdvance]);

    const loadGame = useCallback(async () => {
        if (!userId) {
            return null;
        }

        setStatus('loading');
        setError(null);

        const activeGame = await getActiveGameForPlay(userId);
        setGame(activeGame);

        if (!activeGame) {
            setStatus('ready');
            return null;
        }

        if (!activeGame.currentScene) {
            await bootstrapOpeningScene(activeGame);
        } else {
            setStatus('ready');
        }

        return activeGame;
    }, [bootstrapOpeningScene, userId]);

    useEffect(() => {
        if (!userId || bootstrappedRef.current) {
            return;
        }

        bootstrappedRef.current = true;
        void loadGame().catch((loadError) => {
            const message = loadError instanceof Error
                ? loadError.message
                : 'Unable to load your adventure.';
            setError(message);
            setStatus('error');
        });
    }, [loadGame, userId]);

    const selectChoice = useCallback(async (choiceId: string) => {
        if (!game?.currentScene) {
            return;
        }

        setStatus('processing');
        setError(null);

        try {
            const result = await advanceStoryWithChoice(game, choiceId);

            if (result.scene.isEndingScene) {
                handleSceneAdvance(game, result.scene, result.awardedItem);
                setStatus('completed');
                return;
            }

            handleSceneAdvance(game, result.scene, result.awardedItem);
            setStatus('ready');
        } catch (choiceError) {
            const message = choiceError instanceof Error
                ? choiceError.message
                : 'The story threads tangled. Please try again.';
            setError(message);
            setStatus('error');
        }
    }, [game, handleSceneAdvance]);

    const retry = useCallback(async () => {
        if (!game) {
            await loadGame();
            return;
        }

        if (!game.currentScene) {
            try {
                await bootstrapOpeningScene(game);
            } catch (retryError) {
                const message = retryError instanceof Error
                    ? retryError.message
                    : 'Unable to generate the opening scene.';
                setError(message);
                setStatus('error');
            }
            return;
        }

        setError(null);
        setStatus('ready');
    }, [bootstrapOpeningScene, game, loadGame]);

    const clearPendingReward = useCallback(() => {
        setPendingReward(null);
    }, []);

    return {
        game,
        status,
        error,
        pendingReward,
        selectChoice,
        retry,
        clearPendingReward,
        isLoading: status === 'loading' || status === 'generating',
        isProcessing: status === 'processing',
        isBusy: status === 'loading' || status === 'generating' || status === 'processing',
        isError: status === 'error',
        isReady: status === 'ready',
        isCompleted: status === 'completed',
    };
}
