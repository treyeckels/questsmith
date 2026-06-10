import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { chevronDownOutline, diamondOutline } from 'ionicons/icons';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import { usePlayNow } from '../../shared/hooks/usePlayNow';
import { trackLandingPageViewed } from '../analytics/analyticsService';
import GameplayPreview from './components/GameplayPreview';
import LandingCard from './components/LandingCard';
import LandingSection from './components/LandingSection';
import {
    FEATURE_HIGHLIGHTS,
    GAMEPLAY_SCREENSHOTS,
    HOW_IT_WORKS_STEPS,
    LANDING_DESCRIPTION,
    LANDING_TAGLINE,
} from './landingConfig';
import './LandingPage.css';

const SCREENSHOTS_SECTION_ID = 'gameplay-screenshots';

const LandingPage: React.FC = () => {
    const history = useHistory();
    const playNow = usePlayNow();

    useEffect(() => {
        trackLandingPageViewed();
    }, []);

    const scrollToScreenshots = () => {
        document.getElementById(SCREENSHOTS_SECTION_ID)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <IonPage className="landing-page">
            <IonContent className="landing-page__content" fullscreen>
                <section className="landing-hero">
                    <div className="landing-hero__inner">
                        <p className="landing-hero__brand">QuestSmith</p>
                        <IonIcon
                            className="landing-hero__diamond"
                            icon={diamondOutline}
                            aria-hidden="true"
                        />
                        <h1 className="landing-hero__tagline">{LANDING_TAGLINE}</h1>
                        <p className="landing-hero__description">{LANDING_DESCRIPTION}</p>
                        <div className="landing-hero__actions">
                            <FantasyButton variant="primary" onClick={playNow}>
                                Play Now
                            </FantasyButton>
                            <FantasyButton variant="secondary" onClick={scrollToScreenshots}>
                                View Screenshots
                            </FantasyButton>
                        </div>
                        <button
                            type="button"
                            className="landing-hero__scroll-hint"
                            onClick={scrollToScreenshots}
                            aria-label="Scroll to gameplay screenshots"
                        >
                            <IonIcon icon={chevronDownOutline} aria-hidden="true" />
                        </button>
                    </div>
                </section>

                <LandingSection title="How It Works" subtitle="Three steps into your legend">
                    <div className="landing-cards">
                        {HOW_IT_WORKS_STEPS.map((step) => (
                            <LandingCard
                                key={step.title}
                                title={step.title}
                                icon={step.icon}
                                bullets={step.bullets}
                            />
                        ))}
                    </div>
                </LandingSection>

                <LandingSection
                    id={SCREENSHOTS_SECTION_ID}
                    title="Gameplay Screenshots"
                    subtitle="See the adventure before you begin"
                >
                    <div className="landing-screenshots">
                        {GAMEPLAY_SCREENSHOTS.map((screenshot) => (
                            <figure key={screenshot.id} className="landing-screenshot">
                                <div className="landing-screenshot__frame">
                                    {screenshot.imageSrc ? (
                                        <img
                                            src={screenshot.imageSrc}
                                            alt={screenshot.title}
                                            className="landing-screenshot__image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        screenshot.previewType && (
                                            <GameplayPreview type={screenshot.previewType} />
                                        )
                                    )}
                                </div>
                                <figcaption className="landing-screenshot__caption">
                                    <strong>{screenshot.title}</strong>
                                    <span>{screenshot.caption}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </LandingSection>

                <LandingSection title="Features" subtitle="What awaits in every campaign">
                    <div className="landing-features">
                        {FEATURE_HIGHLIGHTS.map((feature) => (
                            <article key={feature.title} className="landing-feature">
                                <IonIcon
                                    className="landing-feature__icon"
                                    icon={feature.icon}
                                    aria-hidden="true"
                                />
                                <h3 className="landing-feature__title">{feature.title}</h3>
                                <p className="landing-feature__description">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </LandingSection>

                <section className="landing-cta">
                    <div className="landing-cta__inner">
                        <h2 className="landing-cta__title">Ready to Begin Your Adventure?</h2>
                        <div className="landing-cta__actions">
                            <FantasyButton variant="primary" onClick={playNow}>
                                Play Now
                            </FantasyButton>
                            <FantasyButton
                                variant="secondary"
                                onClick={() => history.push('/login')}
                            >
                                Sign In
                            </FantasyButton>
                        </div>
                    </div>
                </section>

                <footer className="landing-footer">
                    <p>QuestSmith — Choose your own adventure fantasy</p>
                </footer>
            </IonContent>
        </IonPage>
    );
};

export default LandingPage;
