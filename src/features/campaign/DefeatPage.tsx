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
import { skullOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { useAuth } from '../../shared/hooks/useAuth';
import { getDefeatedGame } from '../game/gameService';
import type { GameSummary } from '../game/gameTypes';
import './CampaignCompletePage.css';

const DefeatPage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [game, setGame] = useState<GameSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        getDefeatedGame(user.uid)
            .then((defeatedGame) => {
                if (cancelled) {
                    return;
                }

                if (!defeatedGame) {
                    history.replace('/game');
                    return;
                }

                setGame(defeatedGame);
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
                        <p>Loading...</p>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage className="campaign-complete-page">
            <IonHeader className="campaign-complete-page__header">
                <IonToolbar>
                    <IonTitle>QuestSmith</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="campaign-complete-page__content">
                <FantasyFrame footerText="Every hero falls. The story continues.">
                    <section className="campaign-complete-page__hero">
                        <IonIcon className="campaign-complete-page__icon" icon={skullOutline} aria-hidden="true" />
                        <h1>Defeated</h1>
                        <p>
                            <strong>{game.character.name}</strong> has fallen in battle.
                            Your character survives — only this adventure ends here.
                        </p>
                        <p>
                            HP: 0 · Gold: {game.character.gold} · XP: {game.character.xp}
                        </p>
                    </section>

                    <div className="campaign-complete-page__actions">
                        <FantasyButton
                            variant="primary"
                            onClick={() => history.push('/campaign/new?restoreHealth=1')}
                        >
                            Start New Adventure
                        </FantasyButton>
                    </div>
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

export default DefeatPage;
