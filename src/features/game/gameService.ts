import { db } from '../../firebase';
import { COLLECTIONS } from '../../shared/firebase/firestorePaths';
import type { Character } from '../character/characterTypes';
import type { CharacterCreationInput } from '../character/characterTypes';
import { createCharacterGame } from '../character/characterService';
import type { GameDocument, GameSummary } from './gameTypes';

function mapGameDoc(id: string, data: GameDocument): GameSummary {
    return {
        id,
        character: data.character,
        status: data.status,
    };
}

export async function hasActiveGame(userId: string): Promise<boolean> {
    try {
        const snapshot = await db
            .collection(COLLECTIONS.games)
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .limit(1)
            .get();

        return !snapshot.empty;
    } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === 'permission-denied') {
            console.warn('Unable to query saved games; defaulting to character creation.', error);
            return false;
        }
        throw error;
    }
}

export async function getActiveGame(userId: string): Promise<GameSummary | null> {
    try {
        const snapshot = await db
            .collection(COLLECTIONS.games)
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return mapGameDoc(doc.id, doc.data() as GameDocument);
    } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === 'permission-denied') {
            console.warn('Unable to load saved game.', error);
            return null;
        }
        throw error;
    }
}

export async function createGameWithCharacter(
    userId: string,
    input: CharacterCreationInput,
): Promise<string> {
    return createCharacterGame(userId, input);
}

export async function getPostAuthPath(userId: string): Promise<string> {
    const hasGame = await hasActiveGame(userId);
    return hasGame ? '/game' : '/character/create';
}

export type { Character };
