import {
    bookOutline,
    flashOutline,
    gameControllerOutline,
    mapOutline,
    personOutline,
    shieldOutline,
    sparklesOutline,
    trophyOutline,
} from 'ionicons/icons';

export interface HowItWorksStep {
    title: string;
    icon: string;
    bullets: string[];
}

export interface GameplayScreenshot {
    id: string;
    title: string;
    caption: string;
    imageSrc?: string;
    previewType?: 'combat' | 'inventory';
}

export interface FeatureHighlight {
    title: string;
    description: string;
    icon: string;
}

export const LANDING_TAGLINE = 'Your Story. Your Legend.';

export const LANDING_DESCRIPTION =
    'Choose your own adventure fantasy RPG where every campaign is unique.';

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
    {
        title: 'Create a Hero',
        icon: personOutline,
        bullets: ['Choose a class', 'Begin your journey'],
    },
    {
        title: 'Embark on an Adventure',
        icon: mapOutline,
        bullets: ['Gemini acts as your Dungeon Master', 'Every campaign is unique'],
    },
    {
        title: 'Shape Your Story',
        icon: bookOutline,
        bullets: ['Collect items', 'Battle enemies', 'Complete quests'],
    },
];

export const GAMEPLAY_SCREENSHOTS: GameplayScreenshot[] = [
    {
        id: 'character-creation',
        title: 'Character Creation',
        caption: 'Choose your class, pick a portrait, and forge a hero worth remembering.',
        imageSrc: '/assets/landing/character-creation.png',
    },
    {
        id: 'campaign-generation',
        title: 'Campaign Generation',
        caption: 'Every adventure starts with a unique quest hook, location, and objective.',
        imageSrc: '/assets/landing/campaign-generation.png',
    },
    {
        id: 'combat',
        title: 'Combat',
        caption: 'Roll the dice, strike your foes, and survive encounters that test your mettle.',
        previewType: 'combat',
    },
    {
        id: 'inventory',
        title: 'Inventory',
        caption: 'Collect weapons, potions, and quest items earned on your journey.',
        previewType: 'inventory',
    },
];

export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
    {
        title: 'AI-generated campaigns',
        description: 'Each run begins with a fresh fantasy adventure shaped by Gemini.',
        icon: sparklesOutline,
    },
    {
        title: 'Dynamic storytelling',
        description: 'Scenes, choices, and dialogue evolve as you play.',
        icon: bookOutline,
    },
    {
        title: 'Inventory and rewards',
        description: 'Discover loot, potions, and quest items along the way.',
        icon: trophyOutline,
    },
    {
        title: 'Combat system',
        description: 'Roll-based encounters with visible dice and clear outcomes.',
        icon: shieldOutline,
    },
    {
        title: 'Persistent saves',
        description: 'Pick up your adventure on any device, right where you left off.',
        icon: flashOutline,
    },
    {
        title: 'Campaign endings',
        description: 'Reach a satisfying conclusion and begin a new legend.',
        icon: gameControllerOutline,
    },
];
