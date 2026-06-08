import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import {
    cashOutline,
    flashOutline,
    heartOutline,
    shieldOutline,
    sparklesOutline,
    trendingUpOutline,
} from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getClassDefinition, getPortraitDefinition, HEROES_SPRITE_URL } from '../character/characterConfig';
import type { Character } from '../character/characterTypes';
import { signOut } from '../auth/authService';
import type { Campaign } from '../campaign/campaignTypes';
import { gameNeedsCampaignGeneration, getActiveGame } from './gameService';
import { useAuth } from '../../shared/hooks/useAuth';
import './GamePage.css';

const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const GamePage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [character, setCharacter] = useState<Character | null>(null);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        getActiveGame(user.uid)
            .then((game) => {
                if (cancelled) {
                    return;
                }

                if (!game) {
                    history.replace('/character/create');
                    return;
                }

                if (gameNeedsCampaignGeneration(game)) {
                    history.replace('/campaign/generate');
                    return;
                }

                setCharacter(game.character);
                setCampaign(game.campaign);
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user?.uid, history]);

    const handleSignOut = async () => {
        await signOut();
    };

    if (loading || !character) {
        return (
            <IonPage className="game-page">
                <IonContent className="game-page__content ion-padding">
                    <IonText>
                        <p>Loading your adventure...</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    const classDefinition = getClassDefinition(character.class);
    const portrait = getPortraitDefinition(character.portraitId);

    return (
        <IonPage className="game-page">
            <IonHeader className="game-page__header">
                <IonToolbar>
                    <IonTitle>Your Adventure</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="game-page__content ion-padding">
                <section className="game-page__hero-card">
                    <div className="game-page__portrait-wrap">
                        <span
                            className="game-page__portrait"
                            style={{
                                backgroundImage: `url(${HEROES_SPRITE_URL})`,
                                backgroundPosition: portrait?.spritePosition ?? 'center',
                            }}
                            aria-hidden="true"
                        />
                    </div>
                    <div className="game-page__hero-details">
                        <h2>{character.name}</h2>
                        <p>Level {character.level} {classDefinition.label}</p>
                    </div>
                </section>

                <ul className="game-page__stats">
                    <li><IonIcon icon={heartOutline} aria-hidden="true" /><span>HP</span><strong>{character.hp}</strong></li>
                    <li><IonIcon icon={trendingUpOutline} aria-hidden="true" /><span>Attack</span><strong>{formatModifier(character.stats.attackModifier)}</strong></li>
                    <li><IonIcon icon={shieldOutline} aria-hidden="true" /><span>Defense</span><strong>{formatModifier(character.stats.defenseModifier)}</strong></li>
                    <li><IonIcon icon={sparklesOutline} aria-hidden="true" /><span>Magic</span><strong>{formatModifier(character.stats.magicModifier)}</strong></li>
                    <li><IonIcon icon={flashOutline} aria-hidden="true" /><span>Agility</span><strong>{formatModifier(character.stats.agilityModifier)}</strong></li>
                    <li><IonIcon icon={cashOutline} aria-hidden="true" /><span>Gold</span><strong>{character.gold}</strong></li>
                </ul>

                {campaign && (
                    <section className="game-page__campaign">
                        <h3>{campaign.title}</h3>
                        <p className="game-page__campaign-hook">{campaign.mainQuestHook}</p>
                        <p className="game-page__campaign-objective">
                            <strong>Objective:</strong> {campaign.currentObjective}
                        </p>
                    </section>
                )}

                <IonText>
                    <p className="game-page__placeholder">
                        Scene gameplay and choices are coming in Epic 4. Your campaign is saved and ready.
                    </p>
                </IonText>

                <IonButton expand="block" fill="outline" onClick={handleSignOut}>
                    Sign Out
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default GamePage;
