import {
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import {
    cashOutline,
    flashOutline,
    heartOutline,
    mapOutline,
    shieldOutline,
    sparklesOutline,
    trendingUpOutline,
} from 'ionicons/icons';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { signOut } from '../auth/authService';
import { getClassDefinition, getPortraitDefinition, HEROES_SPRITE_URL } from '../character/characterConfig';
import FantasyButton from '../../shared/components/FantasyButton';
import { useAuth } from '../../shared/hooks/useAuth';
import { useGameplay } from '../../shared/hooks/useGameplay';
import { gameNeedsCampaignGeneration } from './gameService';
import './GamePage.css';

const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const GamePage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const {
        game,
        error,
        selectChoice,
        retry,
        isLoading,
        isBusy,
        isError,
        isCompleted,
    } = useGameplay(user?.uid);

    useEffect(() => {
        if (isLoading) {
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

        if (isCompleted || game.status === 'completed') {
            history.replace('/campaign/complete');
        }
    }, [game, history, isCompleted, isLoading]);

    const handleSignOut = async () => {
        await signOut();
    };

    if (isLoading || !game) {
        return (
            <IonPage className="game-page">
                <IonContent className="game-page__content ion-padding ion-text-center">
                    <IonSpinner name="crescent" className="game-page__spinner" />
                    <IonText>
                        <p>Loading your adventure...</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    const character = game.character;
    const campaign = game.campaign;
    const classDefinition = getClassDefinition(character.class);
    const portrait = getPortraitDefinition(character.portraitId);
    const currentLocation = campaign.locations.find(
        (location) => location.id === campaign.currentLocationId,
    );
    const scene = game.currentScene;

    return (
        <IonPage className="game-page">
            <IonHeader className="game-page__header">
                <IonToolbar>
                    <IonTitle>{campaign.title}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="game-page__content">
                <div className="game-page__layout">
                    <section className="game-page__meta">
                        <div className="game-page__hero-card">
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
                        </div>

                        <ul className="game-page__stats">
                            <li><IonIcon icon={heartOutline} aria-hidden="true" /><span>HP</span><strong>{character.hp}</strong></li>
                            <li><IonIcon icon={trendingUpOutline} aria-hidden="true" /><span>Attack</span><strong>{formatModifier(character.stats.attackModifier)}</strong></li>
                            <li><IonIcon icon={shieldOutline} aria-hidden="true" /><span>Defense</span><strong>{formatModifier(character.stats.defenseModifier)}</strong></li>
                            <li><IonIcon icon={sparklesOutline} aria-hidden="true" /><span>Magic</span><strong>{formatModifier(character.stats.magicModifier)}</strong></li>
                            <li><IonIcon icon={flashOutline} aria-hidden="true" /><span>Agility</span><strong>{formatModifier(character.stats.agilityModifier)}</strong></li>
                            <li><IonIcon icon={cashOutline} aria-hidden="true" /><span>Gold</span><strong>{character.gold}</strong></li>
                        </ul>
                    </section>

                    <section className="game-page__story">
                        <header className="game-page__story-header">
                            <p className="game-page__location">
                                <IonIcon icon={mapOutline} aria-hidden="true" />
                                {currentLocation?.name ?? 'Unknown location'}
                            </p>
                            {scene && (
                                <p className="game-page__turn">Turn {scene.turnNumber}</p>
                            )}
                        </header>

                        <div className="game-page__parchment">
                            {isBusy && !scene && (
                                <div className="game-page__scene-loading">
                                    <IonSpinner name="crescent" />
                                    <p>The Dungeon Master is setting the scene...</p>
                                </div>
                            )}

                            {!scene && isError && (
                                <div className="game-page__scene-error" role="alert">
                                    <p>{error ?? 'Something went wrong while generating the scene.'}</p>
                                    <FantasyButton variant="primary" onClick={() => void retry()}>
                                        Try Again
                                    </FantasyButton>
                                </div>
                            )}

                            {scene && (
                                <>
                                    {isError && (
                                        <div className="game-page__scene-error" role="alert">
                                            <p>{error ?? 'Something went wrong while generating the scene.'}</p>
                                            <FantasyButton variant="primary" onClick={() => void retry()}>
                                                Try Again
                                            </FantasyButton>
                                        </div>
                                    )}

                                    <div className="game-page__narrative">
                                        {scene.narrative.split('\n').filter(Boolean).map((paragraph, index) => (
                                            <p key={`${scene.id}-p-${index}`}>{paragraph.trim()}</p>
                                        ))}
                                    </div>

                                    {!isError && scene.isEndingScene && (
                                        <div className="game-page__ending">
                                            <p>The adventure reaches its conclusion.</p>
                                        </div>
                                    )}

                                    {!isError && !scene.isEndingScene && scene.choices.length > 0 && (
                                        <div className="game-page__choices">
                                            <h3>What do you do?</h3>
                                            {scene.choices.map((choice) => (
                                                <FantasyButton
                                                    key={choice.id}
                                                    variant="secondary"
                                                    disabled={isBusy}
                                                    onClick={() => void selectChoice(choice.id)}
                                                >
                                                    {choice.label}
                                                </FantasyButton>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {isBusy && scene && (
                                <div className="game-page__scene-overlay" aria-live="polite">
                                    <IonSpinner name="crescent" />
                                    <p>Weaving the next scene...</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="game-page__footer">
                        {game.campaignCompletion && (
                            <FantasyButton
                                variant="secondary"
                                onClick={() => history.push('/campaign/summary')}
                            >
                                Last Adventure Summary
                            </FantasyButton>
                        )}
                        <FantasyButton variant="secondary" onClick={handleSignOut}>
                            Sign Out
                        </FantasyButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GamePage;
