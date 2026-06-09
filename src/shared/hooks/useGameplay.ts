import { useCallback, useEffect, useRef, useState } from 'react';
import { getPhaseForTurn } from '../../features/campaign/campaignPhase';
import type { ActiveGame, Scene } from '../../features/game/gameTypes';
import { getActiveGameForPlay } from '../../features/game/gameService';
import { advanceStoryWithChoice, generateOpeningScene } from '../../features/game/sceneService';

type GameplayStatus = 'loading' | 'ready' | 'generating' | 'processing' | 'completed' | 'error';

export function useGameplay(userId: string | undefined) {
    const [game, setGame] = useState<ActiveGame | null>(null);
    const [status, setStatus] = useState<GameplayStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const bootstrappedRef = useRef(false);

    const applyScene = useCallback((scene: Scene) => {
        setGame((current) => (current ? { ...current, currentScene: scene } : current));
    }, []);

    const bootstrapOpeningScene = useCallback(async (activeGame: ActiveGame) => {
        setStatus('generating');
        setError(null);
        const scene = await generateOpeningScene(activeGame);
        applyScene(scene);
        setStatus('ready');
    }, [applyScene]);

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
            const nextScene = await advanceStoryWithChoice(game, choiceId);

            if (nextScene.isEndingScene) {
                setGame((current) => (current ? {
                    ...current,
                    currentScene: nextScene,
                    status: 'completed',
                    campaign: {
                        ...current.campaign,
                        phase: 'completed',
                    },
                } : current));
                setStatus('completed');
                return;
            }

            setGame((current) => (current ? {
                ...current,
                currentScene: nextScene,
                campaign: {
                    ...current.campaign,
                    phase: getPhaseForTurn(nextScene.turnNumber),
                },
            } : current));
            setStatus('ready');
        } catch (choiceError) {
            const message = choiceError instanceof Error
                ? choiceError.message
                : 'The story threads tangled. Please try again.';
            setError(message);
            setStatus('error');
        }
    }, [game]);

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

    return {
        game,
        status,
        error,
        selectChoice,
        retry,
        isLoading: status === 'loading' || status === 'generating',
        isProcessing: status === 'processing',
        isBusy: status === 'loading' || status === 'generating' || status === 'processing',
        isError: status === 'error',
        isReady: status === 'ready',
        isCompleted: status === 'completed',
    };
}
