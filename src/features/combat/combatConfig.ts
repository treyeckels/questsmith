import type { EnemyTemplate } from './combatTypes';

export const HIT_THRESHOLD = 12;

export const COMBAT_CHANCE_PER_TURN = 0.25;
export const HIGH_RISK_COMBAT_CHANCE = 0.5;
export const MIN_COMBAT_TURN = 2;
export const MIN_TURNS_BETWEEN_COMBATS = 3;

export const CLASS_COMBAT_ATTACK_MODIFIER: Record<'warrior' | 'rogue' | 'mage', number> = {
    warrior: 3,
    rogue: 2,
    mage: 1,
};

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
    {
        id: 'goblin',
        name: 'Goblin',
        maxHp: 8,
        attackModifier: 1,
        rewardGold: 5,
        rewardXp: 10,
    },
    {
        id: 'bandit',
        name: 'Bandit',
        maxHp: 12,
        attackModifier: 2,
        rewardGold: 8,
        rewardXp: 15,
    },
    {
        id: 'wolf',
        name: 'Wolf',
        maxHp: 10,
        attackModifier: 2,
        rewardGold: 4,
        rewardXp: 12,
    },
    {
        id: 'glimmer-goat',
        name: 'Mischievous Glimmer-Goat',
        maxHp: 14,
        attackModifier: 1,
        rewardGold: 12,
        rewardXp: 20,
    },
];
