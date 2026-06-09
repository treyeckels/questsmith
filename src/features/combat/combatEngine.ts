import { rollD20, rollDie } from '../../shared/utils/dice';
import type { CharacterClass } from '../character/characterTypes';
import {
    CLASS_COMBAT_ATTACK_MODIFIER,
    ENEMY_TEMPLATES,
    HIT_THRESHOLD,
} from './combatConfig';
import type {
    CombatPhase,
    CombatRollRecord,
    CombatState,
    CombatTurnResult,
    Enemy,
    EnemyAttackInput,
    EnemyAttackResult,
    EnemyTemplate,
    PlayerAttackInput,
} from './combatTypes';

export function getClassCombatAttackModifier(characterClass: CharacterClass): number {
    return CLASS_COMBAT_ATTACK_MODIFIER[characterClass];
}

export function createEnemyFromTemplate(template: EnemyTemplate): Enemy {
    return {
        id: template.id,
        name: template.name,
        hp: template.maxHp,
        maxHp: template.maxHp,
        attackModifier: template.attackModifier,
        rewardGold: template.rewardGold,
        rewardXp: template.rewardXp,
    };
}

export function pickRandomEnemyTemplate(): EnemyTemplate {
    const index = Math.floor(Math.random() * ENEMY_TEMPLATES.length);
    return ENEMY_TEMPLATES[index];
}

export function createCombatState(enemy: Enemy, startedAtTurn: number): CombatState {
    return {
        enemy,
        phase: 'active',
        narration: `A ${enemy.name} blocks your path!`,
        lastRoll: null,
        startedAtTurn,
    };
}

function buildRollRecord(
    attacker: 'player' | 'enemy',
    roll: number,
    modifier: number,
    hit: boolean,
    damage: number,
): CombatRollRecord {
    return {
        type: 'attack',
        roll,
        modifier,
        total: roll + modifier,
        outcome: hit ? 'hit' : 'miss',
        damage: hit ? damage : 0,
        attacker,
    };
}

export function resolvePlayerAttack(input: PlayerAttackInput): {
    roll: CombatRollRecord;
    enemy: Enemy;
    enemyDefeated: boolean;
} {
    const modifier = getClassCombatAttackModifier(input.characterClass);
    const roll = rollD20();
    const total = roll + modifier;
    const hit = total >= HIT_THRESHOLD;
    const damage = hit ? rollDie(6) + Math.max(1, Math.floor(modifier / 2)) : 0;

    const enemyHpAfter = hit ? Math.max(0, input.enemy.hp - damage) : input.enemy.hp;

    return {
        roll: buildRollRecord('player', roll, modifier, hit, damage),
        enemy: {
            ...input.enemy,
            hp: enemyHpAfter,
        },
        enemyDefeated: enemyHpAfter <= 0,
    };
}

export function resolveEnemyAttack(input: EnemyAttackInput): EnemyAttackResult {
    const roll = rollD20();
    const modifier = input.enemy.attackModifier;
    const total = roll + modifier;
    const hit = total >= HIT_THRESHOLD + Math.max(0, input.playerDefenseModifier);
    const damage = hit ? rollDie(4) + Math.max(1, modifier) : 0;
    const playerHpAfter = Math.max(0, input.playerHp - damage);

    return {
        roll: buildRollRecord('enemy', roll, modifier, hit, damage),
        damageDealt: damage,
        playerHpAfter,
        playerDefeated: playerHpAfter <= 0,
    };
}

export function resolveCombatTurn(
    characterClass: CharacterClass,
    playerDefenseModifier: number,
    playerHp: number,
    enemy: Enemy,
): CombatTurnResult {
    const playerAttack = resolvePlayerAttack({ characterClass, enemy });
    let phase: CombatPhase = 'active';
    let currentPlayerHp = playerHp;
    let enemyRoll: CombatRollRecord | null = null;

    if (playerAttack.enemyDefeated) {
        phase = 'victory';
    } else {
        const enemyAttack = resolveEnemyAttack({
            enemy: playerAttack.enemy,
            playerDefenseModifier,
            playerHp: currentPlayerHp,
        });
        enemyRoll = enemyAttack.roll;
        currentPlayerHp = enemyAttack.playerHpAfter;

        if (enemyAttack.playerDefeated) {
            phase = 'defeat';
        }
    }

    return {
        playerRoll: playerAttack.roll,
        enemyRoll,
        enemy: playerAttack.enemy,
        playerHp: currentPlayerHp,
        phase,
    };
}
