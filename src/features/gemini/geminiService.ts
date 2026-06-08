import { functions } from '../../firebase';
import type { CampaignGenerationRequest, CampaignGenerationResponse } from './geminiTypes';
import { validateCampaignGenerationResponse } from './geminiSchemas';

interface GenerateCampaignCallableResult {
    campaign: CampaignGenerationResponse;
}

function getCallableErrorMessage(error: unknown): string {
    const firebaseError = error as { code?: string; message?: string };

    switch (firebaseError.code) {
        case 'functions/unauthenticated':
            return 'You must be signed in to generate a campaign.';
        case 'functions/failed-precondition':
            return 'Campaign generation is not configured yet. Run: firebase functions:secrets:set GEMINI_API_KEY';
        case 'functions/invalid-argument':
            return 'Character details were missing. Please create your hero again.';
        case 'functions/internal':
            return 'The Dungeon Master could not weave your campaign. Please try again.';
        case 'functions/unavailable':
        case 'functions/deadline-exceeded':
            return 'Could not reach the campaign service. Redeploy functions and try again.';
        default:
            if (firebaseError.message?.toLowerCase().includes('cors')) {
                return 'Campaign service blocked the request. Redeploy Cloud Functions after the latest update.';
            }
            return firebaseError.message || 'Campaign generation failed. Please try again.';
    }
}

export async function requestCampaignGeneration(
    input: CampaignGenerationRequest,
): Promise<CampaignGenerationResponse> {
    try {
        const callable = functions.httpsCallable('generateCampaign');
        const result = await callable(input);
        const data = result.data as GenerateCampaignCallableResult;

        if (!data?.campaign) {
            throw new Error('Campaign generation returned an empty response.');
        }

        return validateCampaignGenerationResponse(data.campaign);
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('Campaign response')) {
            throw error;
        }
        throw new Error(getCallableErrorMessage(error));
    }
}
