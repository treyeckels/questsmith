import firebase from 'firebase/compat/app';
import type { Character } from '../character/characterTypes';

export type GameStatus = 'active' | 'completed' | 'defeated';

export interface GameDocument {
    userId: string;
    status: GameStatus;
    createdAt: firebase.firestore.Timestamp;
    updatedAt: firebase.firestore.Timestamp;
    character: Character;
    campaign: null;
    currentScene: null;
    inventory: [];
    quests: [];
}

export interface GameSummary {
    id: string;
    character: Character;
    status: GameStatus;
}
