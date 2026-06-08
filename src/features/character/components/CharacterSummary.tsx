import { IonIcon } from '@ionic/react';
import {
    cashOutline,
    flashOutline,
    heartOutline,
    shieldOutline,
    sparklesOutline,
    trendingUpOutline,
} from 'ionicons/icons';
import React from 'react';
import { getClassDefinition, getPortraitDefinition, HEROES_SPRITE_URL } from '../characterConfig';
import type { Character } from '../characterTypes';
import './CharacterSummary.css';

interface CharacterSummaryProps {
    character: Character | null;
}

const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const CharacterSummary: React.FC<CharacterSummaryProps> = ({ character }) => {
    if (!character) {
        return (
            <section className="character-summary character-summary--empty">
                <h2 className="character-summary__title">Your Hero Summary</h2>
                <p className="character-summary__placeholder">
                    Choose a class to preview your hero&apos;s starting stats.
                </p>
            </section>
        );
    }

    const classDefinition = getClassDefinition(character.class);
    const portrait = getPortraitDefinition(character.portraitId);

    return (
        <section className="character-summary">
            <h2 className="character-summary__title">Your Hero Summary</h2>

            <div className="character-summary__portrait-wrap">
                <span
                    className="character-summary__portrait"
                    style={{
                        backgroundImage: `url(${HEROES_SPRITE_URL})`,
                        backgroundPosition: portrait?.spritePosition ?? 'center',
                    }}
                    aria-hidden="true"
                />
            </div>

            <h3 className="character-summary__name">{character.name}</h3>
            <p className="character-summary__classline">
                Level {character.level} {classDefinition.label}
            </p>

            <ul className="character-summary__stats">
                <li>
                    <IonIcon icon={heartOutline} aria-hidden="true" />
                    <span>HP</span>
                    <strong>{character.hp}</strong>
                </li>
                <li>
                    <IonIcon icon={trendingUpOutline} aria-hidden="true" />
                    <span>Attack</span>
                    <strong>{formatModifier(character.stats.attackModifier)}</strong>
                </li>
                <li>
                    <IonIcon icon={shieldOutline} aria-hidden="true" />
                    <span>Defense</span>
                    <strong>{formatModifier(character.stats.defenseModifier)}</strong>
                </li>
                <li>
                    <IonIcon icon={sparklesOutline} aria-hidden="true" />
                    <span>Magic</span>
                    <strong>{formatModifier(character.stats.magicModifier)}</strong>
                </li>
                <li>
                    <IonIcon icon={flashOutline} aria-hidden="true" />
                    <span>Agility</span>
                    <strong>{formatModifier(character.stats.agilityModifier)}</strong>
                </li>
                <li>
                    <IonIcon icon={cashOutline} aria-hidden="true" />
                    <span>Gold</span>
                    <strong>{character.gold}</strong>
                </li>
            </ul>

            <p className="character-summary__flavor">{classDefinition.flavorText}</p>
        </section>
    );
};

export default CharacterSummary;
