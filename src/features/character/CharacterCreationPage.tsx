import {
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { informationCircleOutline, personOutline } from 'ionicons/icons';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { useAuth } from '../../shared/hooks/useAuth';
import { useCharacterCreation } from '../../shared/hooks/useCharacterCreation';
import { hasActiveGame } from '../game/gameService';
import { CLASSES } from './characterConfig';
import CharacterSummary from './components/CharacterSummary';
import ClassCard from './components/ClassCard';
import PortraitPicker from './components/PortraitPicker';
import './CharacterCreationPage.css';

const CharacterCreationPage: React.FC = () => {
    const history = useHistory();
    const { user } = useAuth();

    const {
        name,
        setName,
        selectedClass,
        selectedPortrait,
        previewCharacter,
        isValid,
        submitting,
        error,
        selectClass,
        selectPortrait,
        submit,
    } = useCharacterCreation({
        userId: user?.uid ?? '',
        onSuccess: () => history.replace('/game'),
    });

    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        let cancelled = false;

        hasActiveGame(user.uid)
            .then((exists) => {
                if (!cancelled && exists) {
                    history.replace('/game');
                }
            })
            .catch(() => {
                // Protected route already ensures auth; allow creation on query failure.
            });

        return () => {
            cancelled = true;
        };
    }, [user?.uid, history]);

    if (!user?.uid) {
        return null;
    }

    return (
        <IonPage className="character-page">
            <IonHeader className="character-page__header">
                <IonToolbar>
                    <IonTitle>QuestSmith</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="character-page__content">
                <FantasyFrame footerText="Your hero will be saved to the cloud. Campaign generation arrives in the next epic.">
                    <div className="character-page__layout">
                        <section className="character-page__form">
                            <header className="character-page__intro">
                                <IonIcon
                                    className="character-page__intro-icon"
                                    icon={personOutline}
                                    aria-hidden="true"
                                />
                                <h1 className="character-page__heading">Create Your Hero</h1>
                                <p className="character-page__subheading">
                                    Choose your class, portrait, and name to begin your legend.
                                </p>
                            </header>

                            <div className="character-field">
                                <label className="character-field__label" htmlFor="character-name">
                                    Hero Name
                                </label>
                                <div className="character-field__control">
                                    <IonInput
                                        id="character-name"
                                        className="character-field__input"
                                        placeholder="Enter your hero name"
                                        value={name}
                                        maxlength={24}
                                        onIonInput={(event) => setName(event.detail.value ?? '')}
                                    />
                                </div>
                            </div>

                            <div className="character-section">
                                <h2 className="character-section__title">Choose Your Class</h2>
                                <div className="character-section__cards">
                                    {CLASSES.map((definition) => (
                                        <ClassCard
                                            key={definition.id}
                                            definition={definition}
                                            selected={selectedClass === definition.id}
                                            onSelect={() => selectClass(definition.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="character-section">
                                <h2 className="character-section__title">Choose Your Portrait</h2>
                                <PortraitPicker
                                    selectedPortrait={selectedPortrait}
                                    onSelect={selectPortrait}
                                />
                                <p className="character-section__note">
                                    <IonIcon icon={informationCircleOutline} aria-hidden="true" />
                                    You can customize your hero further in the game.
                                </p>
                            </div>

                            {error && (
                                <IonText>
                                    <p role="alert" className="character-page__error">
                                        {error}
                                    </p>
                                </IonText>
                            )}

                            <div className="character-page__actions character-page__actions--mobile">
                                <FantasyButton
                                    variant="primary"
                                    disabled={!isValid || submitting}
                                    onClick={submit}
                                >
                                    {submitting ? 'Forging Hero...' : 'Begin Adventure'}
                                </FantasyButton>
                            </div>
                        </section>

                        <aside className="character-page__summary">
                            <CharacterSummary character={previewCharacter} />
                            <div className="character-page__actions character-page__actions--desktop">
                                <FantasyButton
                                    variant="primary"
                                    disabled={!isValid || submitting}
                                    onClick={submit}
                                >
                                    {submitting ? 'Forging Hero...' : 'Begin Adventure'}
                                </FantasyButton>
                            </div>
                        </aside>
                    </div>
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

export default CharacterCreationPage;
