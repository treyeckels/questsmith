import { IonIcon } from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import React from 'react';
import { HEROES_SPRITE_URL, PORTRAITS } from '../characterConfig';
import type { PortraitId } from '../characterTypes';
import './PortraitPicker.css';

interface PortraitPickerProps {
    selectedPortrait: PortraitId | null;
    onSelect: (portraitId: PortraitId) => void;
}

const PortraitPicker: React.FC<PortraitPickerProps> = ({ selectedPortrait, onSelect }) => (
    <div className="portrait-picker">
        {PORTRAITS.map((portrait) => {
            const selected = selectedPortrait === portrait.id;

            return (
                <button
                    key={portrait.id}
                    type="button"
                    className={`portrait-picker__option${selected ? ' portrait-picker__option--selected' : ''}`}
                    onClick={() => onSelect(portrait.id)}
                    aria-pressed={selected}
                    aria-label={`Select ${portrait.label} portrait`}
                >
                    <span
                        className="portrait-picker__image"
                        style={{
                            backgroundImage: `url(${HEROES_SPRITE_URL})`,
                            backgroundPosition: portrait.spritePosition,
                        }}
                        aria-hidden="true"
                    />
                    {selected && (
                        <IonIcon
                            className="portrait-picker__check"
                            icon={checkmarkCircle}
                            aria-hidden="true"
                        />
                    )}
                </button>
            );
        })}
    </div>
);

export default PortraitPicker;
