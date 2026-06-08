import { useMemo, useState } from 'react';
import { buildCharacterFromInput, createCharacterGame } from '../../features/character/characterService';
import { getClassDefinition } from '../../features/character/characterConfig';
import type { Character, CharacterClass, CharacterCreationInput, PortraitId } from '../../features/character/characterTypes';
import { validateCharacterName } from '../utils/validators';

interface UseCharacterCreationOptions {
    userId: string;
    onSuccess: (gameId: string) => void;
}

export function useCharacterCreation({ userId, onSuccess }: UseCharacterCreationOptions) {
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
    const [selectedPortrait, setSelectedPortrait] = useState<PortraitId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewCharacter = useMemo<Character | null>(() => {
        if (!selectedClass) {
            return null;
        }

        const trimmedName = name.trim() || 'Your Hero';
        const portraitId = selectedPortrait ?? getClassDefinition(selectedClass).defaultPortraitId;

        return buildCharacterFromInput({
            name: trimmedName,
            class: selectedClass,
            portraitId,
        });
    }, [name, selectedClass, selectedPortrait]);

    const isValid = useMemo(() => {
        if (validateCharacterName(name)) {
            return false;
        }
        if (!selectedClass) {
            return false;
        }
        if (!selectedPortrait) {
            return false;
        }
        return true;
    }, [name, selectedClass, selectedPortrait]);

    const selectClass = (classId: CharacterClass) => {
        setSelectedClass(classId);
        setSelectedPortrait(getClassDefinition(classId).defaultPortraitId);
        setError(null);
    };

    const selectPortrait = (portraitId: PortraitId) => {
        setSelectedPortrait(portraitId);
        setError(null);
    };

    const submit = async () => {
        if (!selectedClass || !selectedPortrait) {
            setError('Select a class and portrait to continue.');
            return;
        }

        const input: CharacterCreationInput = {
            name: name.trim(),
            class: selectedClass,
            portraitId: selectedPortrait,
        };

        setSubmitting(true);
        setError(null);

        try {
            const gameId = await createCharacterGame(userId, input);
            onSuccess(gameId);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to save your hero.');
        } finally {
            setSubmitting(false);
        }
    };

    return {
        name,
        setName,
        selectedClass,
        selectedPortrait,
        previewCharacter,
        isValid,
        submitting,
        error,
        selectClass,
        selectPortrait,
        submit,
    };
}
