import { IonIcon } from '@ionic/react';
import React from 'react';

interface LandingCardProps {
    title: string;
    icon: string;
    bullets: string[];
}

const LandingCard: React.FC<LandingCardProps> = ({ title, icon, bullets }) => (
    <article className="landing-card">
        <div className="landing-card__icon-wrap" aria-hidden="true">
            <IonIcon icon={icon} />
        </div>
        <h3 className="landing-card__title">{title}</h3>
        <ul className="landing-card__bullets">
            {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
            ))}
        </ul>
    </article>
);

export default LandingCard;
