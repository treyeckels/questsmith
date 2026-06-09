import type { CampaignPhase } from './campaignTypes';

/** Turn number when a choice should trigger the campaign completion scene. */
export const CAMPAIGN_COMPLETION_TURN = 10;

export function getPhaseForTurn(turnNumber: number): CampaignPhase {
    if (turnNumber <= 1) {
        return 'opening';
    }

    if (turnNumber <= 4) {
        return 'rising_action';
    }

    if (turnNumber <= 7) {
        return 'climax';
    }

    if (turnNumber <= CAMPAIGN_COMPLETION_TURN) {
        return 'finale';
    }

    return 'completed';
}

export function shouldGenerateCompletionScene(currentTurnNumber: number): boolean {
    return currentTurnNumber >= CAMPAIGN_COMPLETION_TURN;
}

export function formatCampaignPhase(phase: CampaignPhase): string {
    switch (phase) {
        case 'opening':
            return 'Opening';
        case 'rising_action':
            return 'Rising Action';
        case 'climax':
            return 'Climax';
        case 'finale':
            return 'Finale';
        case 'completed':
            return 'Completed';
    }
}
