export function rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
}

export function rollD20(): number {
    return rollDie(20);
}
