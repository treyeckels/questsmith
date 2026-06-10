import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import type {
    AnalyticsEventParams,
    CampaignCompletedEventParams,
    CampaignStartedEventParams,
    CharacterCreatedEventParams,
    CombatCompletedEventParams,
    CombatStartedEventParams,
    ItemAcquiredEventParams,
    LoginEventParams,
    SignUpEventParams,
    StoryTurnCompletedEventParams,
} from './analyticsTypes';

type ParamValue = string | number | boolean;

const BLOCKED_PARAM_KEYS = new Set([
    'email',
    'name',
    'character_name',
    'hero_name',
    'narrative',
    'title',
    'description',
    'story_text',
    'scene_text',
    'choice_label',
    'user_email',
]);

let analyticsInitialized = false;

function canUseAnalytics(): boolean {
    return typeof window !== 'undefined' && Boolean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);
}

function getAnalytics(): firebase.analytics.Analytics | null {
    if (!canUseAnalytics()) {
        return null;
    }

    try {
        if (!analyticsInitialized) {
            firebase.analytics();
            analyticsInitialized = true;
        }

        return firebase.analytics();
    } catch (error) {
        console.warn('Firebase Analytics is unavailable.', error);
        return null;
    }
}

function sanitizeParams(params: Record<string, ParamValue>): Record<string, ParamValue> {
    const sanitized: Record<string, ParamValue> = {};

    for (const [key, value] of Object.entries(params)) {
        const normalizedKey = key.toLowerCase();

        if (BLOCKED_PARAM_KEYS.has(normalizedKey)) {
            continue;
        }

        if (typeof value === 'string') {
            if (value.includes('@')) {
                continue;
            }

            sanitized[key] = value.slice(0, 100);
            continue;
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

function logEvent(eventName: string, params?: Record<string, ParamValue>): void {
    try {
        const analytics = getAnalytics();
        if (!analytics) {
            return;
        }

        if (params && Object.keys(params).length > 0) {
            analytics.logEvent(eventName, sanitizeParams(params));
            return;
        }

        analytics.logEvent(eventName);
    } catch (error) {
        console.warn(`Analytics event "${eventName}" failed.`, error);
    }
}

function toParams(params: AnalyticsEventParams): Record<string, ParamValue> {
    return params as Record<string, ParamValue>;
}

export function trackLoginScreenViewed(): void {
    logEvent('screen_view', toParams({ screen_name: 'login' }));
}

export function trackLogin(params: LoginEventParams): void {
    logEvent('login', toParams(params));
}

export function trackSignUp(params: SignUpEventParams): void {
    logEvent('sign_up', toParams(params));
}

export function trackCharacterCreated(params: CharacterCreatedEventParams): void {
    logEvent('character_created', toParams(params));
}

export function trackCampaignStarted(params: CampaignStartedEventParams): void {
    logEvent('campaign_started', toParams(params));
}

export function trackStoryTurnCompleted(params: StoryTurnCompletedEventParams): void {
    logEvent('story_turn_completed', toParams(params));
}

export function trackItemAcquired(params: ItemAcquiredEventParams): void {
    logEvent('item_acquired', toParams(params));
}

export function trackCombatStarted(params: CombatStartedEventParams): void {
    logEvent('combat_started', toParams(params));
}

export function trackCombatCompleted(params: CombatCompletedEventParams): void {
    logEvent('combat_completed', toParams(params));
}

export function trackCampaignCompleted(params: CampaignCompletedEventParams): void {
    logEvent('campaign_completed', toParams(params));
}

export function trackFeedbackFormOpened(): void {
    logEvent('feedback_form_opened');
}
