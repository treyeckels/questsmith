export const COLLECTIONS = {
    users: 'users',
    games: 'games',
} as const;

export const userDoc = (userId: string) =>
    `${COLLECTIONS.users}/${userId}`;

export const gameDoc = (gameId: string) =>
    `${COLLECTIONS.games}/${gameId}`;

export const gameTurnsCollection = (gameId: string) =>
    `${COLLECTIONS.games}/${gameId}/turns`;
