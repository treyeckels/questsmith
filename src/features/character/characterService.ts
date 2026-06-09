import firebase from 'firebase/compat/app';
import { db } from '../../firebase';
import { COLLECTIONS } from '../../shared/firebase/firestorePaths';
import { validateCharacterName } from '../../shared/utils/validators';
import { getClassDefinition } from './characterConfig';
import type { Character, CharacterCreationInput } from './characterTypes';

export function buildCharacterFromInput(input: CharacterCreationInput): Character {
    const classDefinition = getClassDefinition(input.class);

    return {
        name: input.name.trim(),
        class: input.class,
        portraitId: input.portraitId,
        level: 1,
        xp: 0,
        hp: classDefinition.startingHp,
        maxHp: classDefinition.startingHp,
        gold: classDefinition.startingGold,
        stats: { ...classDefinition.stats },
    };
}

export function validateCharacterInput(input: CharacterCreationInput): string | null {
    const nameError = validateCharacterName(input.name);
    if (nameError) {
        return nameError;
    }

    if (!input.class) {
        return 'Select a class to continue.';
    }

    if (!input.portraitId) {
        return 'Select a portrait to continue.';
    }

    return null;
}

export async function createCharacterGame(
    userId: string,
    input: CharacterCreationInput,
): Promise<string> {
    const validationError = validateCharacterInput(input);
    if (validationError) {
        throw new Error(validationError);
    }

    const character = buildCharacterFromInput(input);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    const gameRef = await db.collection(COLLECTIONS.games).add({
        userId,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
        character,
        campaign: null,
        currentScene: null,
        campaignCompletion: null,
        inventory: [],
        quests: [],
    });

    return gameRef.id;
}
