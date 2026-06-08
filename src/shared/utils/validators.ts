const CHARACTER_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9 '\-]*$/;

export function validateCharacterName(name: string): string | null {
    const trimmed = name.trim();

    if (!trimmed) {
        return 'Enter a character name to continue.';
    }

    if (trimmed.length < 2) {
        return 'Character name must be at least 2 characters.';
    }

    if (trimmed.length > 24) {
        return 'Character name must be 24 characters or fewer.';
    }

    if (!CHARACTER_NAME_PATTERN.test(trimmed)) {
        return 'Name may only contain letters, numbers, spaces, hyphens, and apostrophes.';
    }

    return null;
}
