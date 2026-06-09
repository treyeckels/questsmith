import firebase from 'firebase/compat/app';
import { db } from '../../firebase';
import { COLLECTIONS } from '../../shared/firebase/firestorePaths';
import { createCharacterGame } from '../character/characterService';
import type { Character, CharacterCreationInput } from '../character/characterTypes';
import type {
    ActiveGame,
    CampaignCompletionRecord,
    CompletedGame,
    GameDocument,
    GameSummary,
    Scene,
    TurnDocument,
} from './gameTypes';
import type { Campaign } from '../campaign/campaignTypes';
import { normalizeCampaignPhase } from '../campaign/campaignService';
import type { InventoryItem } from '../inventory/inventoryTypes';
import { normalizeInventory } from '../inventory/inventoryService';
import type { CombatState } from '../combat/combatTypes';

function mapGameDoc(id: string, data: GameDocument): GameSummary {
    const turnNumber = data.currentScene?.turnNumber ?? 1;

    return {
        id,
        character: data.character,
        campaign: data.campaign
            ? normalizeCampaignPhase(data.campaign, turnNumber)
            : null,
        status: data.status,
        campaignCompletion: data.campaignCompletion ?? null,
        inventory: normalizeInventory(data.inventory),
        lastItemRewardTurn: data.lastItemRewardTurn ?? null,
        lastCombatTurn: data.lastCombatTurn ?? null,
        combatState: data.combatState ?? null,
    };
}

function mapActiveGameDoc(id: string, data: GameDocument): ActiveGame | null {
    if (!data.campaign) {
        return null;
    }

    const turnNumber = data.currentScene?.turnNumber ?? 1;

    return {
        id,
        character: data.character,
        campaign: normalizeCampaignPhase(data.campaign, turnNumber),
        currentScene: data.currentScene ?? null,
        status: data.status,
        campaignCompletion: data.campaignCompletion ?? null,
        inventory: normalizeInventory(data.inventory),
        lastItemRewardTurn: data.lastItemRewardTurn ?? null,
        lastCombatTurn: data.lastCombatTurn ?? null,
        combatState: data.combatState ?? null,
    };
}

function mapCompletedGameDoc(id: string, data: GameDocument): CompletedGame | null {
    if (!data.campaign || !data.campaignCompletion || data.status !== 'completed') {
        return null;
    }

    return {
        id,
        character: data.character,
        campaign: data.campaign,
        status: 'completed',
        campaignCompletion: data.campaignCompletion,
        inventory: normalizeInventory(data.inventory),
        lastItemRewardTurn: data.lastItemRewardTurn ?? null,
        lastCombatTurn: data.lastCombatTurn ?? null,
        combatState: data.combatState ?? null,
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

export async function getActiveGameForPlay(userId: string): Promise<ActiveGame | null> {
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
        return mapActiveGameDoc(doc.id, doc.data() as GameDocument);
    } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === 'permission-denied') {
            console.warn('Unable to load saved game.', error);
            return null;
        }
        throw error;
    }
}

export function gameNeedsCampaignGeneration(game: GameSummary): boolean {
    return !game.campaign;
}

export async function getCompletedGame(userId: string): Promise<CompletedGame | null> {
    try {
        const snapshot = await db
            .collection(COLLECTIONS.games)
            .where('userId', '==', userId)
            .where('status', '==', 'completed')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return mapCompletedGameDoc(doc.id, doc.data() as GameDocument);
    } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === 'permission-denied') {
            console.warn('Unable to load completed game.', error);
            return null;
        }
        throw error;
    }
}

export async function getLatestGame(userId: string): Promise<GameSummary | null> {
    const activeGame = await getActiveGame(userId);
    if (activeGame) {
        return activeGame;
    }

    const defeatedGame = await getDefeatedGame(userId);
    if (defeatedGame) {
        return defeatedGame;
    }

    const completedGame = await getCompletedGame(userId);
    if (completedGame) {
        return completedGame;
    }

    try {
        const snapshot = await db
            .collection(COLLECTIONS.games)
            .where('userId', '==', userId)
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
            return null;
        }
        throw error;
    }
}

export async function getDefeatedGame(userId: string): Promise<GameSummary | null> {
    try {
        const snapshot = await db
            .collection(COLLECTIONS.games)
            .where('userId', '==', userId)
            .where('status', '==', 'defeated')
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
            console.warn('Unable to load defeated game.', error);
            return null;
        }
        throw error;
    }
}

export async function getPostAuthPath(userId: string): Promise<string> {
    const activeGame = await getActiveGame(userId);

    if (activeGame) {
        if (gameNeedsCampaignGeneration(activeGame)) {
            return '/campaign/generate';
        }

        return '/game';
    }

    const defeatedGame = await getDefeatedGame(userId);
    if (defeatedGame) {
        return '/campaign/defeat';
    }

    const completedGame = await getCompletedGame(userId);
    if (completedGame) {
        return '/campaign/complete';
    }

    const latestGame = await getLatestGame(userId);
    if (!latestGame) {
        return '/character/create';
    }

    if (gameNeedsCampaignGeneration(latestGame)) {
        return '/campaign/generate';
    }

    return '/game';
}

export async function createGameWithCharacter(
    userId: string,
    input: CharacterCreationInput,
): Promise<string> {
    return createCharacterGame(userId, input);
}

function stripUndefined<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

export async function updateCurrentScene(gameId: string, scene: Scene): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        currentScene: stripUndefined(scene),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function saveTurnRecord(
    gameId: string,
    turn: Omit<TurnDocument, 'createdAt'>,
): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId)
        .collection('turns')
        .doc(`turn-${turn.turnNumber}`)
        .set({
            ...stripUndefined(turn),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
}

export async function getRecentTurnSummaries(gameId: string, limit: number): Promise<string[]> {
    const snapshot = await db.collection(COLLECTIONS.games).doc(gameId)
        .collection('turns')
        .orderBy('turnNumber', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs
        .map((doc) => (doc.data() as TurnDocument).sceneSummary)
        .filter(Boolean)
        .reverse();
}

export async function getAllTurnRecords(gameId: string): Promise<TurnDocument[]> {
    const snapshot = await db.collection(COLLECTIONS.games).doc(gameId)
        .collection('turns')
        .orderBy('turnNumber', 'asc')
        .get();

    return snapshot.docs.map((doc) => doc.data() as TurnDocument);
}

export async function getTurnCount(gameId: string): Promise<number> {
    const snapshot = await db.collection(COLLECTIONS.games).doc(gameId)
        .collection('turns')
        .get();

    return snapshot.size;
}

export async function updateCampaignPhase(gameId: string, campaign: Campaign): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        campaign,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function persistInventoryReward(
    gameId: string,
    inventory: InventoryItem[],
    lastItemRewardTurn: number,
): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        inventory: stripUndefined(inventory),
        lastItemRewardTurn,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function persistCombatState(
    gameId: string,
    options: {
        character: Character;
        combatState: CombatState;
        lastCombatTurn?: number | null;
    },
): Promise<void> {
    const update: Record<string, unknown> = {
        character: stripUndefined(options.character),
        combatState: stripUndefined(options.combatState),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (options.lastCombatTurn !== undefined) {
        update.lastCombatTurn = options.lastCombatTurn;
    }

    await db.collection(COLLECTIONS.games).doc(gameId).update(update);
}

export async function persistCombatVictory(
    gameId: string,
    options: {
        character: Character;
        inventory: InventoryItem[];
        lastItemRewardTurn: number | null;
        lastCombatTurn: number;
    },
): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        character: stripUndefined(options.character),
        inventory: stripUndefined(options.inventory),
        lastItemRewardTurn: options.lastItemRewardTurn,
        lastCombatTurn: options.lastCombatTurn,
        combatState: null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function clearCombatState(gameId: string, character: Character): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        character: stripUndefined(character),
        combatState: null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function defeatGame(gameId: string, character: Character): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        status: 'defeated',
        character: stripUndefined(character),
        combatState: null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function updateCharacterStats(gameId: string, character: Character): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        character: stripUndefined(character),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export async function completeCampaign(
    gameId: string,
    options: {
        campaign: Campaign;
        endingScene: Scene;
        completion: Omit<CampaignCompletionRecord, 'completedAt'>;
    },
): Promise<void> {
    await db.collection(COLLECTIONS.games).doc(gameId).update({
        status: 'completed',
        campaign: {
            ...options.campaign,
            phase: 'completed',
        },
        currentScene: stripUndefined(options.endingScene),
        campaignCompletion: {
            ...stripUndefined(options.completion),
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

export type { Character };
