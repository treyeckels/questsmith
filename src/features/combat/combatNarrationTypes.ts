export interface CombatNarrationRequest {
    enemy: string;
    roll: number;
    attackModifier: number;
    damage: number;
    outcome: 'hit' | 'miss';
    enemyRoll?: number | null;
    enemyDamage?: number;
    enemyOutcome?: 'hit' | 'miss' | null;
}

export interface CombatNarrationResponse {
    narrative: string;
}
