import firebase from 'firebase/compat/app';
import type { InventoryItem, InventoryItemRarity, InventoryItemType } from './inventoryTypes';

const ITEM_TYPES: InventoryItemType[] = ['weapon', 'armor', 'potion', 'quest', 'misc'];
const ITEM_RARITIES: InventoryItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function isItemType(value: unknown): value is InventoryItemType {
    return typeof value === 'string' && ITEM_TYPES.includes(value as InventoryItemType);
}

function isItemRarity(value: unknown): value is InventoryItemRarity {
    return typeof value === 'string' && ITEM_RARITIES.includes(value as InventoryItemRarity);
}

function isTimestamp(value: unknown): value is firebase.firestore.Timestamp {
    return value instanceof firebase.firestore.Timestamp;
}

function isInventoryItem(value: unknown): value is InventoryItem {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const item = value as Record<string, unknown>;

    return typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.description === 'string'
        && isItemType(item.type)
        && isItemRarity(item.rarity)
        && isTimestamp(item.acquiredAt);
}

export function normalizeInventory(raw: unknown): InventoryItem[] {
    if (!Array.isArray(raw)) {
        return [];
    }

    return raw.filter(isInventoryItem);
}

export function formatItemType(type: InventoryItemType): string {
    switch (type) {
        case 'weapon':
            return 'Weapon';
        case 'armor':
            return 'Armor';
        case 'potion':
            return 'Potion';
        case 'quest':
            return 'Quest';
        case 'misc':
            return 'Misc';
    }
}

export function formatItemRarity(rarity: InventoryItemRarity): string {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function sortInventoryItems(items: InventoryItem[]): InventoryItem[] {
    return [...items].sort((left, right) => right.acquiredAt.toMillis() - left.acquiredAt.toMillis());
}

export function createInventoryItem(
    item: Omit<InventoryItem, 'acquiredAt'> & { acquiredAt?: firebase.firestore.Timestamp },
): InventoryItem {
    return {
        ...item,
        acquiredAt: item.acquiredAt ?? firebase.firestore.Timestamp.now(),
    };
}

export function addItemToInventory(
    inventory: InventoryItem[],
    item: InventoryItem,
): InventoryItem[] {
    return [...inventory, item];
}
