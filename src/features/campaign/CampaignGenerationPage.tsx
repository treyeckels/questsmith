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
import { mapOutline, peopleOutline, sparklesOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { useAuth } from '../../shared/hooks/useAuth';
import { useCampaignGeneration } from '../../shared/hooks/useCampaignGeneration';
import type { GameSummary } from '../game/gameTypes';
import { gameNeedsCampaignGeneration, getActiveGame } from '../game/gameService';
import type { Campaign } from './campaignTypes';
import './CampaignGenerationPage.css';

const CampaignGenerationPage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [game, setGame] = useState<GameSummary | null>(null);
    const [resolving, setResolving] = useState(true);

    const skipGeneration = Boolean(game?.campaign);

    const {
        status,
        campaign,
        error,
        retry,
        isLoading,
        isSuccess,
        isError,
    } = useCampaignGeneration({
        gameId: game?.id ?? null,
        character: game?.character ?? null,
        skip: skipGeneration || resolving,
    });

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        getActiveGame(user.uid)
            .then((activeGame) => {
                if (cancelled) {
                    return;
                }

                if (!activeGame) {
                    history.replace('/character/create');
                    return;
                }

                if (!gameNeedsCampaignGeneration(activeGame)) {
                    history.replace('/game');
                    return;
                }

                setGame(activeGame);
            })
            .finally(() => {
                if (!cancelled) {
                    setResolving(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user?.uid, history]);

    const handleContinue = () => {
        history.replace('/game');
    };

    if (resolving || !game) {
        return (
            <IonPage className="campaign-page">
                <IonContent className="campaign-page__content ion-padding ion-text-center">
                    <IonSpinner name="crescent" />
                    <IonText>
                        <p>Preparing your adventure...</p>
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
                <FantasyFrame footerText="Your campaign is saved to the cloud. Scene gameplay arrives in the next epic.">
                    {isLoading && <CampaignLoadingState heroName={game.character.name} />}
                    {isError && (
                        <CampaignErrorState message={error} onRetry={retry} />
                    )}
                    {isSuccess && campaign && (
                        <CampaignPreview campaign={campaign} onContinue={handleContinue} />
                    )}
                    {status === 'idle' && !isLoading && !isError && !isSuccess && (
                        <CampaignLoadingState heroName={game.character.name} />
                    )}
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

const CampaignLoadingState: React.FC<{ heroName: string }> = ({ heroName }) => (
    <section className="campaign-state campaign-state--loading">
        <IonSpinner name="crescent" className="campaign-state__spinner" />
        <h1 className="campaign-state__title">Weaving Your Campaign</h1>
        <p className="campaign-state__text">
            The Dungeon Master is crafting a unique adventure for <strong>{heroName}</strong>.
            This may take a moment.
        </p>
    </section>
);

const CampaignErrorState: React.FC<{ message: string | null; onRetry: () => void }> = ({
    message,
    onRetry,
}) => (
    <section className="campaign-state campaign-state--error">
        <IonIcon className="campaign-state__icon" icon={sparklesOutline} aria-hidden="true" />
        <h1 className="campaign-state__title">The Threads Tangled</h1>
        <p className="campaign-state__text" role="alert">
            {message ?? 'Something went wrong while generating your campaign.'}
        </p>
        <FantasyButton variant="primary" onClick={onRetry}>
            Try Again
        </FantasyButton>
    </section>
);

const CampaignPreview: React.FC<{ campaign: Campaign; onContinue: () => void }> = ({
    campaign,
    onContinue,
}) => {
    const startingLocation = campaign.locations.find(
        (location) => location.id === campaign.currentLocationId,
    );

    return (
        <section className="campaign-preview">
            <div className="campaign-preview__parchment">
                <header className="campaign-preview__header">
                    <IonIcon className="campaign-preview__icon" icon={sparklesOutline} aria-hidden="true" />
                    <h1 className="campaign-preview__title">{campaign.title}</h1>
                    <p className="campaign-preview__hook">{campaign.mainQuestHook}</p>
                </header>

                <div className="campaign-preview__section">
                    <h2>Current Objective</h2>
                    <p>{campaign.currentObjective}</p>
                </div>

                <div className="campaign-preview__section">
                    <h2>
                        <IonIcon icon={mapOutline} aria-hidden="true" />
                        Starting Location
                    </h2>
                    <p className="campaign-preview__highlight">
                        {startingLocation?.name ?? campaign.currentLocationId}
                    </p>
                    {startingLocation?.description && (
                        <p className="campaign-preview__muted">{startingLocation.description}</p>
                    )}
                </div>

                <div className="campaign-preview__section">
                    <h2>
                        <IonIcon icon={peopleOutline} aria-hidden="true" />
                        Notable NPCs
                    </h2>
                    <ul className="campaign-preview__list">
                        {campaign.npcs.slice(0, 5).map((npc) => (
                            <li key={npc.id}>
                                <strong>{npc.name}</strong> — {npc.role}
                                <span>{npc.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="campaign-preview__section">
                    <h2>
                        <IonIcon icon={mapOutline} aria-hidden="true" />
                        Known Locations ({campaign.locations.length})
                    </h2>
                    <ul className="campaign-preview__list campaign-preview__list--compact">
                        {campaign.locations.map((location) => (
                            <li key={location.id}>
                                <strong>{location.name}</strong>
                                {location.unlocked && <em> (starting area)</em>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="campaign-preview__actions">
                    <FantasyButton variant="primary" onClick={onContinue}>
                        Continue to Adventure
                    </FantasyButton>
                </div>
            </div>
        </section>
    );
};

export default CampaignGenerationPage;
