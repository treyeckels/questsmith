import { useCallback, useEffect, useState } from 'react';
import { generateAndSaveCampaign } from '../../features/campaign/campaignService';
import type { Campaign } from '../../features/campaign/campaignTypes';
import type { Character } from '../../features/character/characterTypes';

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseCampaignGenerationOptions {
    gameId: string | null;
    character: Character | null;
    skip?: boolean;
}

export function useCampaignGeneration({ gameId, character, skip = false }: UseCampaignGenerationOptions) {
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async () => {
        if (!gameId || !character) {
            setError('Unable to find your hero. Please create a character first.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setError(null);

        try {
            const result = await generateAndSaveCampaign(gameId, {
                characterName: character.name,
                characterClass: character.class,
            });
            setCampaign(result);
            setStatus('success');
        } catch (generationError) {
            const message = generationError instanceof Error
                ? generationError.message
                : 'The Dungeon Master could not weave your campaign. Please try again.';
            setError(message);
            setStatus('error');
        }
    }, [gameId, character]);

    useEffect(() => {
        if (skip || status !== 'idle') {
            return;
        }

        void generate();
    }, [skip, status, generate]);

    return {
        status,
        campaign,
        error,
        retry: generate,
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        isError: status === 'error',
    };
}
