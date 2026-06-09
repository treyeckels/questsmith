import type { CampaignSummary } from './campaignTypes';
import type { CampaignCompletionRecord } from '../game/gameTypes';

export function buildCampaignSummary(
    completion: CampaignCompletionRecord,
): CampaignSummary {
    return {
        title: completion.title,
        mainObjective: completion.mainObjective,
        startingLocationName: completion.startingLocationName,
        turnsPlayed: completion.turnsPlayed,
        majorEvents: completion.majorEvents,
        endingNarrative: completion.endingNarrative,
    };
}
