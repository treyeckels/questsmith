import type { CharacterClass } from '../character/characterTypes';

export interface Enemy {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attackModifier: number;
    rewardGold: number;
    rewardXp: number;
}

export type CombatRollOutcome = 'hit' | 'miss';

export interface CombatRollRecord {
    type: 'attack' | 'defense';
    roll: number;
    modifier: number;
    total: number;
    outcome: CombatRollOutcome;
    damage: number;
    attacker: 'player' | 'enemy';
}

export type CombatPhase = 'active' | 'victory' | 'defeat';

export interface CombatState {
    enemy: Enemy;
    phase: CombatPhase;
    narration: string;
    lastRoll: CombatRollRecord | null;
    startedAtTurn: number;
}

export interface EnemyTemplate {
    id: string;
    name: string;
    maxHp: number;
    attackModifier: number;
    rewardGold: number;
    rewardXp: number;
}

export interface PlayerAttackInput {
    characterClass: CharacterClass;
    enemy: Enemy;
    enemyDefenseModifier?: number;
}

export interface PlayerAttackResult {
    roll: CombatRollRecord;
    enemy: Enemy;
    enemyDefeated: boolean;
}

export interface EnemyAttackInput {
    enemy: Enemy;
    playerDefenseModifier: number;
    playerHp: number;
}

export interface EnemyAttackResult {
    roll: CombatRollRecord;
    damageDealt: number;
    playerHpAfter: number;
    playerDefeated: boolean;
}

export interface CombatTurnResult {
    playerRoll: CombatRollRecord;
    enemyRoll: CombatRollRecord | null;
    enemy: Enemy;
    playerHp: number;
    phase: CombatPhase;
}
