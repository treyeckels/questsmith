import { db } from '../../firebase';
import { COLLECTIONS } from '../../shared/firebase/firestorePaths';

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

export async function getPostAuthPath(userId: string): Promise<string> {
    const hasGame = await hasActiveGame(userId);
    return hasGame ? '/game' : '/character/create';
}
