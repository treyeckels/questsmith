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
import { bookOutline, mapOutline, sparklesOutline, statsChartOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { useAuth } from '../../shared/hooks/useAuth';
import { getLatestGame } from '../game/gameService';
import type { CampaignSummary } from './campaignTypes';
import { buildCampaignSummary } from './campaignSummaryService';
import './CampaignSummaryPage.css';

const CampaignSummaryPage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [summary, setSummary] = useState<CampaignSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        getLatestGame(user.uid)
            .then((game) => {
                if (cancelled) {
                    return;
                }

                if (!game?.campaignCompletion) {
                    history.replace('/game');
                    return;
                }

                setSummary(buildCampaignSummary(game.campaignCompletion));
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

    if (loading || !summary) {
        return (
            <IonPage className="campaign-summary-page">
                <IonContent className="campaign-summary-page__content ion-padding ion-text-center">
                    <IonSpinner name="crescent" />
                    <IonText>
                        <p>Reviewing your adventure...</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage className="campaign-summary-page">
            <IonHeader className="campaign-summary-page__header">
                <IonToolbar>
                    <IonTitle>Campaign Summary</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="campaign-summary-page__content">
                <FantasyFrame footerText="This summary is generated from your saved campaign state.">
                    <section className="campaign-summary">
                        <div className="campaign-summary__parchment">
                            <header className="campaign-summary__header">
                                <IonIcon
                                    className="campaign-summary__icon"
                                    icon={bookOutline}
                                    aria-hidden="true"
                                />
                                <h1>{summary.title}</h1>
                            </header>

                            <div className="campaign-summary__section">
                                <h2>
                                    <IonIcon icon={sparklesOutline} aria-hidden="true" />
                                    Main Objective
                                </h2>
                                <p>{summary.mainObjective}</p>
                            </div>

                            <div className="campaign-summary__section">
                                <h2>
                                    <IonIcon icon={mapOutline} aria-hidden="true" />
                                    Starting Location
                                </h2>
                                <p>{summary.startingLocationName}</p>
                            </div>

                            <div className="campaign-summary__section">
                                <h2>
                                    <IonIcon icon={statsChartOutline} aria-hidden="true" />
                                    Turns Played
                                </h2>
                                <p>{summary.turnsPlayed}</p>
                            </div>

                            <div className="campaign-summary__section">
                                <h2>Major Story Events</h2>
                                {summary.majorEvents.length > 0 ? (
                                    <ul className="campaign-summary__events">
                                        {summary.majorEvents.map((event) => (
                                            <li key={`event-${event.turnNumber}`}>
                                                <strong>Turn {event.turnNumber}</strong>
                                                <span>{event.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="campaign-summary__muted">
                                        Your hero&apos;s journey unfolded quietly, turn by turn.
                                    </p>
                                )}
                            </div>

                            <div className="campaign-summary__actions">
                                <FantasyButton
                                    variant="secondary"
                                    onClick={() => history.push('/campaign/complete')}
                                >
                                    Back to Campaign Complete
                                </FantasyButton>
                            </div>
                        </div>
                    </section>
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

export default CampaignSummaryPage;
