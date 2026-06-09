import { auth } from '../../firebase';
import type {
    CampaignGenerationRequest,
    CampaignGenerationResponse,
    CombatNarrationRequest,
    CombatNarrationResponse,
    ItemRewardGenerationRequest,
    ItemRewardGenerationResponse,
    SceneGenerationRequest,
    SceneGenerationResponse,
} from './geminiTypes';
import {
    validateCampaignGenerationResponse,
    validateCombatNarrationResponse,
    validateItemRewardGenerationResponse,
    validateSceneGenerationResponse,
} from './geminiSchemas';

interface GenerateCampaignApiResult {
    campaign?: CampaignGenerationResponse;
    error?: string;
}

const CAMPAIGN_API_PATH = '/api/generateCampaign';

interface GenerateSceneApiResult {
    scene?: SceneGenerationResponse;
    error?: string;
}

const SCENE_API_PATH = '/api/generateScene';
const ITEM_REWARD_API_PATH = '/api/generateItemReward';
const COMBAT_NARRATION_API_PATH = '/api/generateCombatNarration';

interface GenerateItemRewardApiResult {
    item?: ItemRewardGenerationResponse;
    error?: string;
}

interface GenerateCombatNarrationApiResult {
    narration?: CombatNarrationResponse;
    error?: string;
}

async function postGeminiApi<TPayload extends object, TResult>(
    path: string,
    body: TPayload,
    apiName = 'Story generation',
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
            `${apiName} API returned the app page instead of JSON. Redeploy functions and hosting together.`,
        );
    }

    let payload: { error?: string } & Partial<Record<string, unknown>> = {};
    try {
        payload = await response.json() as typeof payload;
    } catch {
        // Non-JSON error body
    }

    if (!response.ok) {
        const fallback = `${apiName} failed (HTTP ${response.status}).`;
        throw new Error(payload.error?.trim() || fallback);
    }

    return payload as TResult;
}

export async function requestCampaignGeneration(
    input: CampaignGenerationRequest,
): Promise<CampaignGenerationResponse> {
    const payload = await postGeminiApi<CampaignGenerationRequest, GenerateCampaignApiResult>(
        CAMPAIGN_API_PATH,
        input,
        'Campaign generation',
    );

    if (!payload.campaign) {
        throw new Error('Campaign generation returned an empty response.');
    }

    return validateCampaignGenerationResponse(payload.campaign);
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

    return validateSceneGenerationResponse(payload.scene, {
        isCampaignComplete: input.isCampaignComplete,
    });
}

export async function requestItemRewardGeneration(
    input: ItemRewardGenerationRequest,
): Promise<ItemRewardGenerationResponse> {
    const payload = await postGeminiApi<ItemRewardGenerationRequest, GenerateItemRewardApiResult>(
        ITEM_REWARD_API_PATH,
        input,
        'Item reward generation',
    );

    if (!payload.item) {
        throw new Error('Item reward generation returned an empty response.');
    }

    return validateItemRewardGenerationResponse(payload.item);
}

export async function requestCombatNarration(
    input: CombatNarrationRequest,
): Promise<CombatNarrationResponse> {
    const payload = await postGeminiApi<CombatNarrationRequest, GenerateCombatNarrationApiResult>(
        COMBAT_NARRATION_API_PATH,
        input,
        'Combat narration',
    );

    if (!payload.narration) {
        throw new Error('Combat narration returned an empty response.');
    }

    return validateCombatNarrationResponse(payload.narration);
}
