import { IonIcon } from '@ionic/react';
import {
    flashOutline,
    heartOutline,
    shieldOutline,
    skullOutline,
} from 'ionicons/icons';
import React from 'react';

interface GameplayPreviewProps {
    type: 'combat' | 'inventory';
}

const GameplayPreview: React.FC<GameplayPreviewProps> = ({ type }) => {
    if (type === 'combat') {
        return (
            <div className="landing-preview landing-preview--combat" aria-hidden="true">
                <p className="landing-preview__eyebrow">Combat Encounter</p>
                <h4 className="landing-preview__heading">Glimmer-Goat Ambush</h4>
                <div className="landing-preview__combat-stats">
                    <div className="landing-preview__stat">
                        <span>Trey the Brave</span>
                        <strong>
                            <IonIcon icon={heartOutline} /> 18 / 24 HP
                        </strong>
                    </div>
                    <div className="landing-preview__stat">
                        <span>Glimmer-Goat</span>
                        <strong>
                            <IonIcon icon={skullOutline} /> 6 / 14 HP
                        </strong>
                    </div>
                </div>
                <div className="landing-preview__roll">
                    <p>Attack Roll</p>
                    <strong>d20 + 3 = 17</strong>
                    <span>Hit! 8 damage dealt.</span>
                </div>
                <div className="landing-preview__actions">
                    <span>Attack</span>
                    <span>Defend</span>
                    <span>Flee</span>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-preview landing-preview--inventory" aria-hidden="true">
            <header className="landing-preview__inventory-header">
                <IonIcon icon={shieldOutline} />
                <span>Inventory</span>
            </header>
            <div className="landing-preview__parchment">
                <article className="landing-preview__item">
                    <strong>Rusty Shortsword</strong>
                    <span>Weapon · +2 Attack</span>
                </article>
                <article className="landing-preview__item">
                    <strong>Healing Draught</strong>
                    <span>Potion · Restores 12 HP</span>
                </article>
                <article className="landing-preview__item">
                    <strong>Glimmer-Goat Hoof</strong>
                    <span>Quest · Proof of victory</span>
                </article>
                <p className="landing-preview__gold">
                    <IonIcon icon={flashOutline} /> 47 gold
                </p>
            </div>
        </div>
    );
};

export default GameplayPreview;
