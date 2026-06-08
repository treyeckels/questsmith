import { IonIcon } from '@ionic/react';
import { flameOutline, flashOutline, shieldOutline } from 'ionicons/icons';
import React from 'react';
import type { ClassDefinition } from '../characterTypes';
import './ClassCard.css';

const CLASS_ICONS = {
    shield: shieldOutline,
    flash: flashOutline,
    flame: flameOutline,
} as const;

interface ClassCardProps {
    definition: ClassDefinition;
    selected: boolean;
    onSelect: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ definition, selected, onSelect }) => (
    <button
        type="button"
        className={`class-card${selected ? ' class-card--selected' : ''}`}
        onClick={onSelect}
        aria-pressed={selected}
    >
        <div className="class-card__icon-wrap" aria-hidden="true">
            <IonIcon icon={CLASS_ICONS[definition.icon as keyof typeof CLASS_ICONS]} />
        </div>
        <div className="class-card__content">
            <h3 className="class-card__title">{definition.label}</h3>
            <p className="class-card__description">{definition.description}</p>
            <ul className="class-card__highlights">
                {definition.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                ))}
            </ul>
        </div>
    </button>
);

export default ClassCard;
