import type { ChoiceRiskLevel } from '../game/gameTypes';
import type { ActiveGame } from '../game/gameTypes';
import { trackCombatCompleted, trackItemAcquired } from '../analytics/analyticsService';
import { requestCombatNarration } from '../gemini/geminiService';
import { addItemToInventory } from '../inventory/inventoryService';
import type { InventoryItem } from '../inventory/inventoryTypes';
import { tryAwardItemReward } from '../rewards/rewardService';
import {
    COMBAT_CHANCE_PER_TURN,
    HIGH_RISK_COMBAT_CHANCE,
    MIN_COMBAT_TURN,
    MIN_TURNS_BETWEEN_COMBATS,
} from './combatConfig';
import {
    createCombatState,
    createEnemyFromTemplate,
    pickRandomEnemyTemplate,
    resolveCombatTurn,
} from './combatEngine';
import type { CombatState, CombatTurnResult } from './combatTypes';
import {
    clearCombatState,
    defeatGame,
    persistCombatState,
    persistCombatVictory,
} from '../game/gameService';

export function shouldTriggerCombat(
    turnNumber: number,
    lastCombatTurn: number | null,
    options: { riskLevel?: ChoiceRiskLevel; isCampaignComplete?: boolean; hasActiveCombat?: boolean } = {},
): boolean {
    if (options.hasActiveCombat || options.isCampaignComplete) {
        return false;
    }

    if (turnNumber < MIN_COMBAT_TURN) {
        return false;
    }

    const turnsSinceLastCombat = lastCombatTurn === null
        ? turnNumber
        : turnNumber - lastCombatTurn;

    if (turnsSinceLastCombat < MIN_TURNS_BETWEEN_COMBATS) {
        return false;
    }

    const chance = options.riskLevel === 'high'
        ? HIGH_RISK_COMBAT_CHANCE
        : COMBAT_CHANCE_PER_TURN;

    return Math.random() < chance;
}

export function startCombatEncounter(turnNumber: number): CombatState {
    const template = pickRandomEnemyTemplate();
    const enemy = createEnemyFromTemplate(template);
    return createCombatState(enemy, turnNumber);
}

export async function narrateCombatTurn(
    enemyName: string,
    turn: CombatTurnResult,
): Promise<string> {
    const primaryRoll = turn.playerRoll;

    try {
        const response = await requestCombatNarration({
            enemy: enemyName,
            roll: primaryRoll.roll,
            attackModifier: primaryRoll.modifier,
            damage: primaryRoll.damage,
            outcome: primaryRoll.outcome,
            enemyRoll: turn.enemyRoll?.roll ?? null,
            enemyDamage: turn.enemyRoll?.damage ?? 0,
            enemyOutcome: turn.enemyRoll?.outcome ?? null,
        });

        return response.narrative;
    } catch (error) {
        console.warn('Combat narration failed; using fallback text.', error);

        if (primaryRoll.outcome === 'hit') {
            const counter = turn.enemyRoll?.outcome === 'hit'
                ? ` The ${enemyName} strikes back for ${turn.enemyRoll.damage} damage!`
                : turn.enemyRoll
                    ? ` The ${enemyName} misses its counterattack.`
                    : '';

            return `You roll ${primaryRoll.roll} (+${primaryRoll.modifier}) and hit for ${primaryRoll.damage} damage!${counter}`;
        }

        const counter = turn.enemyRoll?.outcome === 'hit'
            ? ` The ${enemyName} retaliates for ${turn.enemyRoll.damage} damage!`
            : '';

        return `You roll ${primaryRoll.roll} (+${primaryRoll.modifier}) and miss.${counter}`;
    }
}

export interface CombatAttackResult {
    combatState: CombatState;
    character: ActiveGame['character'];
    awardedItem: InventoryItem | null;
    turnResult: CombatTurnResult;
    victoryRewards: { xp: number; gold: number } | null;
}

export async function executeCombatAttack(game: ActiveGame): Promise<CombatAttackResult> {
    if (!game.combatState || game.combatState.phase !== 'active') {
        throw new Error('No active combat encounter.');
    }

    const turnResult = resolveCombatTurn(
        game.character.class,
        game.character.stats.defenseModifier,
        game.character.hp,
        game.combatState.enemy,
    );

    const narration = await narrateCombatTurn(game.combatState.enemy.name, turnResult);

    const updatedCharacter = {
        ...game.character,
        hp: turnResult.playerHp,
    };

    let awardedItem: InventoryItem | null = null;

    if (turnResult.phase === 'victory') {
        updatedCharacter.xp += turnResult.enemy.rewardXp;
        updatedCharacter.gold += turnResult.enemy.rewardGold;

        awardedItem = await tryAwardItemReward(game, {
            turnNumber: game.currentScene?.turnNumber ?? game.combatState.startedAtTurn,
            sceneNarrative: `Victory over ${turnResult.enemy.name}. ${narration}`,
            selectedChoice: `Defeated ${turnResult.enemy.name}`,
        });

        const inventory = awardedItem
            ? addItemToInventory(game.inventory, awardedItem)
            : game.inventory;

        await persistCombatVictory(game.id, {
            character: updatedCharacter,
            inventory,
            lastItemRewardTurn: awardedItem
                ? (game.currentScene?.turnNumber ?? game.combatState.startedAtTurn)
                : game.lastItemRewardTurn,
            lastCombatTurn: game.combatState.startedAtTurn,
        });

        trackCombatCompleted({
            campaign_id: game.id,
            enemy_id: turnResult.enemy.id,
            combat_result: 'victory',
            turn_number: game.combatState.startedAtTurn,
        });

        if (awardedItem) {
            trackItemAcquired({
                campaign_id: game.id,
                item_type: awardedItem.type,
                item_rarity: awardedItem.rarity,
                source: 'combat',
                turn_number: game.combatState.startedAtTurn,
            });
        }

        return {
            combatState: {
                ...game.combatState,
                enemy: turnResult.enemy,
                phase: 'victory',
                narration,
                lastRoll: turnResult.playerRoll,
            },
            character: updatedCharacter,
            awardedItem,
            turnResult,
            victoryRewards: {
                xp: turnResult.enemy.rewardXp,
                gold: turnResult.enemy.rewardGold,
            },
        };
    }

    if (turnResult.phase === 'defeat') {
        await defeatGame(game.id, updatedCharacter);

        trackCombatCompleted({
            campaign_id: game.id,
            enemy_id: turnResult.enemy.id,
            combat_result: 'defeat',
            turn_number: game.combatState.startedAtTurn,
        });

        return {
            combatState: {
                ...game.combatState,
                enemy: turnResult.enemy,
                phase: 'defeat',
                narration,
                lastRoll: turnResult.playerRoll,
            },
            character: updatedCharacter,
            awardedItem: null,
            turnResult,
            victoryRewards: null,
        };
    }

    const nextCombatState: CombatState = {
        ...game.combatState,
        enemy: turnResult.enemy,
        phase: 'active',
        narration,
        lastRoll: turnResult.playerRoll,
    };

    await persistCombatState(game.id, {
        character: updatedCharacter,
        combatState: nextCombatState,
    });

    return {
        combatState: nextCombatState,
        character: updatedCharacter,
        awardedItem: null,
        turnResult,
        victoryRewards: null,
    };
}

export async function persistNewCombatEncounter(
    game: ActiveGame,
    combatState: CombatState,
): Promise<void> {
    await persistCombatState(game.id, {
        character: game.character,
        combatState,
        lastCombatTurn: game.lastCombatTurn,
    });
}

export async function dismissCombatVictory(game: ActiveGame): Promise<void> {
    await clearCombatState(game.id, game.character);
}
