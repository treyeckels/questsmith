import { auth } from '../../firebase';
import type { CampaignGenerationRequest, CampaignGenerationResponse } from './geminiTypes';
import { validateCampaignGenerationResponse } from './geminiSchemas';

interface GenerateCampaignApiResult {
    campaign?: CampaignGenerationResponse;
    error?: string;
}

const CAMPAIGN_API_PATH = '/api/generateCampaign';

export async function requestCampaignGeneration(
    input: CampaignGenerationRequest,
): Promise<CampaignGenerationResponse> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be signed in to generate a campaign.');
    }

    const idToken = await user.getIdToken();
    const response = await fetch(CAMPAIGN_API_PATH, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(input),
    });

    let payload: GenerateCampaignApiResult = {};
    try {
        payload = await response.json() as GenerateCampaignApiResult;
    } catch {
        // Non-JSON error body
    }

    if (!response.ok) {
        throw new Error(
            payload.error
            || `Campaign generation failed (${response.status}). Redeploy hosting and functions, then try again.`,
        );
    }

    if (!payload.campaign) {
        throw new Error('Campaign generation returned an empty response.');
    }

    return validateCampaignGenerationResponse(payload.campaign);
}
