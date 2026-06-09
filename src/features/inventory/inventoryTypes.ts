import firebase from 'firebase/compat/app';

export type InventoryItemType = 'weapon' | 'armor' | 'potion' | 'quest' | 'misc';

export type InventoryItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    type: InventoryItemType;
    rarity: InventoryItemRarity;
    acquiredAt: firebase.firestore.Timestamp;
}
