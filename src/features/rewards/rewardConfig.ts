import type { InventoryItemRarity } from '../inventory/inventoryTypes';

/** Probability (0–1) that an eligible turn awards an item. */
export const REWARD_CHANCE_PER_TURN = 0.3;

/** Minimum turns between item rewards. */
export const MIN_TURNS_BETWEEN_REWARDS = 2;

/** First turn number that can award an item. */
export const MIN_REWARD_TURN = 2;

/** Relative weights when rolling item rarity. */
export const RARITY_WEIGHTS: Record<InventoryItemRarity, number> = {
    common: 50,
    uncommon: 30,
    rare: 12,
    epic: 6,
    legendary: 2,
};
