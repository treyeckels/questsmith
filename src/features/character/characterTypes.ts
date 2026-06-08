export type CharacterClass = 'warrior' | 'rogue' | 'mage';

export type PortraitId = 'warrior' | 'rogue' | 'mage';

export interface CharacterStats {
    attackModifier: number;
    defenseModifier: number;
    magicModifier: number;
    agilityModifier: number;
}

export interface Character {
    name: string;
    class: CharacterClass;
    portraitId: PortraitId;
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    gold: number;
    stats: CharacterStats;
}

export interface CharacterCreationInput {
    name: string;
    class: CharacterClass;
    portraitId: PortraitId;
}

export interface ClassDefinition {
    id: CharacterClass;
    label: string;
    description: string;
    flavorText: string;
    highlights: string[];
    icon: string;
    startingHp: number;
    startingGold: number;
    stats: CharacterStats;
    defaultPortraitId: PortraitId;
}

export interface PortraitDefinition {
    id: PortraitId;
    label: string;
    spritePosition: string;
}
