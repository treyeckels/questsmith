import { auth } from '../../firebase';
import type { CampaignGenerationRequest, CampaignGenerationResponse, SceneGenerationRequest, SceneGenerationResponse } from './geminiTypes';
import { validateCampaignGenerationResponse, validateSceneGenerationResponse } from './geminiSchemas';

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

interface GenerateSceneApiResult {
    scene?: SceneGenerationResponse;
    error?: string;
}

const SCENE_API_PATH = '/api/generateScene';

async function postGeminiApi<TPayload extends object, TResult>(
    path: string,
    body: TPayload,
): Promise<TResult> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be signed in to continue your adventure.');
    }

    const idToken = await user.getIdToken();
    const response = await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
        throw new Error(
            'Story API returned the app page instead of JSON. Redeploy functions and hosting together.',
        );
    }

    let payload: { error?: string } & Partial<Record<string, unknown>> = {};
    try {
        payload = await response.json() as typeof payload;
    } catch {
        // Non-JSON error body
    }

    if (!response.ok) {
        const fallback = `Story generation failed (HTTP ${response.status}).`;
        throw new Error(payload.error?.trim() || fallback);
    }

    return payload as TResult;
}

export async function requestSceneGeneration(
    input: SceneGenerationRequest,
): Promise<SceneGenerationResponse> {
    const payload = await postGeminiApi<SceneGenerationRequest, GenerateSceneApiResult>(
        SCENE_API_PATH,
        input,
    );

    if (!payload.scene) {
        throw new Error('Scene generation returned an empty response.');
    }

    return validateSceneGenerationResponse(payload.scene);
}
