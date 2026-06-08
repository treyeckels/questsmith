import type { CharacterClass, ClassDefinition, PortraitDefinition } from './characterTypes';

export const HEROES_SPRITE_URL = '/img/heroes.png';

export const PORTRAITS: PortraitDefinition[] = [
    { id: 'warrior', label: 'Warrior', spritePosition: '0% center' },
    { id: 'rogue', label: 'Rogue', spritePosition: '50% center' },
    { id: 'mage', label: 'Mage', spritePosition: '100% center' },
];

export const CLASSES: ClassDefinition[] = [
    {
        id: 'warrior',
        label: 'Warrior',
        description: 'Strong and resilient frontline fighters.',
        flavorText:
            'Warriors are durable fighters who excel in melee combat and protecting their allies.',
        highlights: ['High HP', 'High Defense'],
        icon: 'shield',
        startingHp: 20,
        startingGold: 10,
        stats: {
            attackModifier: 3,
            defenseModifier: 2,
            magicModifier: 0,
            agilityModifier: 1,
        },
        defaultPortraitId: 'warrior',
    },
    {
        id: 'rogue',
        label: 'Rogue',
        description: 'Agile and elusive strikers.',
        flavorText:
            'Rogues strike from the shadows with speed and precision, favoring agility over brute force.',
        highlights: ['High Crit Chance', 'High Agility'],
        icon: 'flash',
        startingHp: 16,
        startingGold: 10,
        stats: {
            attackModifier: 2,
            defenseModifier: 1,
            magicModifier: 0,
            agilityModifier: 3,
        },
        defaultPortraitId: 'rogue',
    },
    {
        id: 'mage',
        label: 'Mage',
        description: 'Master the elements and arcane arts.',
        flavorText:
            'Mages wield powerful spells and arcane knowledge, trading durability for magical might.',
        highlights: ['High Spell Power', 'Lower HP'],
        icon: 'flame',
        startingHp: 14,
        startingGold: 10,
        stats: {
            attackModifier: 0,
            defenseModifier: 1,
            magicModifier: 3,
            agilityModifier: 1,
        },
        defaultPortraitId: 'mage',
    },
];

export function getClassDefinition(classId: CharacterClass): ClassDefinition {
    const definition = CLASSES.find((entry) => entry.id === classId);
    if (!definition) {
        throw new Error(`Unknown character class: ${classId}`);
    }
    return definition;
}

export function getPortraitDefinition(portraitId: string): PortraitDefinition | undefined {
    return PORTRAITS.find((entry) => entry.id === portraitId);
}
