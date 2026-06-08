import { IonIcon } from '@ionic/react';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import React from 'react';
import './FantasyFrame.css';

interface FantasyFrameProps {
    children: React.ReactNode;
    footerText?: string;
}

const FantasyFrame: React.FC<FantasyFrameProps> = ({
    children,
    footerText = 'Your adventure is saved in the cloud. Play on any device, anytime.',
}) => (
    <div className="fantasy-frame">
        <header className="fantasy-frame__header">
            <h1 className="fantasy-frame__title">QuestSmith</h1>
            <p className="fantasy-frame__tagline">Your Story. Your Legend.</p>
        </header>

        <div className="fantasy-frame__body">
            {children}
        </div>

        <footer className="fantasy-frame__footer">
            <IonIcon
                className="fantasy-frame__footer-icon"
                icon={shieldCheckmarkOutline}
                aria-hidden="true"
            />
            <p className="fantasy-frame__footer-text">{footerText}</p>
        </footer>
    </div>
);

export default FantasyFrame;
