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
import { ribbonOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { openFeedbackForm } from '../feedback/feedbackService';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { useAuth } from '../../shared/hooks/useAuth';
import { getCompletedGame } from '../game/gameService';
import type { CompletedGame } from '../game/gameTypes';
import './CampaignCompletePage.css';

const CampaignCompletePage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [game, setGame] = useState<CompletedGame | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        getCompletedGame(user.uid)
            .then((completedGame) => {
                if (cancelled) {
                    return;
                }

                if (!completedGame) {
                    history.replace('/game');
                    return;
                }

                setGame(completedGame);
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [history, user?.uid]);

    if (loading || !game) {
        return (
            <IonPage className="campaign-complete-page">
                <IonContent className="campaign-complete-page__content ion-padding ion-text-center">
                    <IonSpinner name="crescent" />
                    <IonText>
                        <p>Gathering your tale&apos;s ending...</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    const completion = game.campaignCompletion;

    return (
        <IonPage className="campaign-complete-page">
            <IonHeader className="campaign-complete-page__header">
                <IonToolbar>
                    <IonTitle>QuestSmith</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="campaign-complete-page__content">
                <FantasyFrame footerText="Your completed adventure is saved to the cloud.">
                    <section className="campaign-complete">
                        <div className="campaign-complete__parchment">
                            <header className="campaign-complete__header">
                                <IonIcon
                                    className="campaign-complete__icon"
                                    icon={ribbonOutline}
                                    aria-hidden="true"
                                />
                                <p className="campaign-complete__eyebrow">Campaign Complete</p>
                                <h1 className="campaign-complete__title">{completion.title}</h1>
                            </header>

                            <div className="campaign-complete__narrative">
                                {completion.endingNarrative.split('\n').filter(Boolean).map((paragraph, index) => (
                                    <p key={`ending-${index}`}>{paragraph.trim()}</p>
                                ))}
                            </div>

                            <div className="campaign-complete__actions">
                                <FantasyButton
                                    variant="primary"
                                    onClick={() => history.push('/campaign/new')}
                                >
                                    Start New Adventure
                                </FantasyButton>
                                <FantasyButton
                                    variant="secondary"
                                    onClick={() => history.push('/campaign/summary')}
                                >
                                    View Campaign Summary
                                </FantasyButton>
                                <FantasyButton
                                    variant="secondary"
                                    onClick={openFeedbackForm}
                                >
                                    Leave Feedback
                                </FantasyButton>
                            </div>
                        </div>
                    </section>
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

export default CampaignCompletePage;
