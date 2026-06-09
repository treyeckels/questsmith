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
import { sparklesOutline } from 'ionicons/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { useAuth } from '../../shared/hooks/useAuth';
import { getLatestGame } from '../game/gameService';
import type { GameSummary } from '../game/gameTypes';
import { startNewAdventure } from './campaignService';
import './CampaignGenerationPage.css';

const NewAdventurePage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [game, setGame] = useState<GameSummary | null>(null);
    const [resolving, setResolving] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        getLatestGame(user.uid)
            .then((latestGame) => {
                if (cancelled) {
                    return;
                }

                if (!latestGame) {
                    history.replace('/character/create');
                    return;
                }

                setGame(latestGame);
            })
            .finally(() => {
                if (!cancelled) {
                    setResolving(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [history, user?.uid]);

    const beginNewAdventure = useCallback(async () => {
        if (!game) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await startNewAdventure(game.id, {
                characterName: game.character.name,
                characterClass: game.character.class,
            });
            history.replace('/game');
        } catch (adventureError) {
            const message = adventureError instanceof Error
                ? adventureError.message
                : 'Unable to start a new adventure.';
            setError(message);
            setLoading(false);
        }
    }, [game, history]);

    useEffect(() => {
        if (!resolving && game && !loading && !error) {
            void beginNewAdventure();
        }
    }, [beginNewAdventure, error, game, loading, resolving]);

    if (resolving || !game) {
        return (
            <IonPage className="campaign-page">
                <IonContent className="campaign-page__content ion-padding ion-text-center">
                    <IonSpinner name="crescent" />
                    <IonText>
                        <p>Preparing your next adventure...</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage className="campaign-page">
            <IonHeader className="campaign-page__header">
                <IonToolbar>
                    <IonTitle>QuestSmith</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="campaign-page__content">
                <FantasyFrame footerText="Your hero keeps their stats. Only the campaign changes.">
                    {loading && (
                        <section className="campaign-state campaign-state--loading">
                            <IonSpinner name="crescent" className="campaign-state__spinner" />
                            <h1 className="campaign-state__title">A New Tale Begins</h1>
                            <p className="campaign-state__text">
                                The Dungeon Master is weaving a fresh campaign for{' '}
                                <strong>{game.character.name}</strong>.
                            </p>
                        </section>
                    )}

                    {error && (
                        <section className="campaign-state campaign-state--error">
                            <IonIcon className="campaign-state__icon" icon={sparklesOutline} aria-hidden="true" />
                            <h1 className="campaign-state__title">The Threads Tangled</h1>
                            <p className="campaign-state__text" role="alert">{error}</p>
                            <FantasyButton variant="primary" onClick={() => void beginNewAdventure()}>
                                Try Again
                            </FantasyButton>
                        </section>
                    )}
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

export default NewAdventurePage;
