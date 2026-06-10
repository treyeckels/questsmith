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
import {
    eyeOffOutline,
    eyeOutline,
    lockClosedOutline,
    mailOutline,
    personOutline,
} from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import FantasyButton from '../../shared/components/FantasyButton';
import FantasyFrame from '../../shared/components/FantasyFrame';
import { trackLogin, trackLoginScreenViewed, trackSignUp } from '../analytics/analyticsService';
import { getPostAuthPath } from '../game/gameService';
import { getAuthErrorMessage } from './authErrors';
import {
    handleGoogleRedirectResult,
    sendPasswordReset,
    signIn,
    signInWithGoogle,
    signUp,
} from './authService';
import './AuthPage.css';

type StatusMessage = { type: 'error' | 'success'; text: string } | null;

const AuthPage: React.FC = () => {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
    const [submitting, setSubmitting] = useState(false);

    const redirectAfterAuth = async (userId: string) => {
        const path = await getPostAuthPath(userId);
        history.replace(path);
    };

    useEffect(() => {
        trackLoginScreenViewed();
    }, []);

    useEffect(() => {
        let cancelled = false;

        handleGoogleRedirectResult()
            .then(async (result) => {
                if (cancelled || !result?.user?.uid) {
                    return;
                }

                if (result.additionalUserInfo?.isNewUser) {
                    trackSignUp({ auth_method: 'google' });
                } else {
                    trackLogin({ auth_method: 'google' });
                }

                await redirectAfterAuth(result.user.uid);
            })
            .catch((error) => {
                if (!cancelled) {
                    setStatusMessage({ type: 'error', text: getAuthErrorMessage(error) });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [history]);

    const validateCredentials = (): string | null => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            return 'Please enter both email and password.';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters.';
        }
        return null;
    };

    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatusMessage(null);

        const validationError = validateCredentials();
        if (validationError) {
            setStatusMessage({ type: 'error', text: validationError });
            return;
        }

        setSubmitting(true);

        try {
            const result = await signIn({ email: email.trim(), password });
            const userId = result.user?.uid;
            if (!userId) {
                throw new Error('Authentication succeeded without a user.');
            }
            trackLogin({ auth_method: 'email' });
            await redirectAfterAuth(userId);
        } catch (error) {
            setStatusMessage({ type: 'error', text: getAuthErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateAccount = async () => {
        setStatusMessage(null);

        const validationError = validateCredentials();
        if (validationError) {
            setStatusMessage({ type: 'error', text: validationError });
            return;
        }

        setSubmitting(true);

        try {
            const result = await signUp({ email: email.trim(), password });
            const userId = result.user?.uid;
            if (!userId) {
                throw new Error('Authentication succeeded without a user.');
            }
            trackSignUp({ auth_method: 'email' });
            await redirectAfterAuth(userId);
        } catch (error) {
            setStatusMessage({ type: 'error', text: getAuthErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        setStatusMessage(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setStatusMessage({ type: 'error', text: 'Enter your email address to reset your password.' });
            return;
        }

        setSubmitting(true);

        try {
            await sendPasswordReset(trimmedEmail);
            setStatusMessage({
                type: 'success',
                text: 'Password reset email sent. Check your inbox.',
            });
        } catch (error) {
            setStatusMessage({ type: 'error', text: getAuthErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setStatusMessage(null);
        setSubmitting(true);

        try {
            const result = await signInWithGoogle();
            if (!result) {
                return;
            }

            const userId = result.user?.uid;
            if (!userId) {
                throw new Error('Authentication succeeded without a user.');
            }

            if (result.additionalUserInfo?.isNewUser) {
                trackSignUp({ auth_method: 'google' });
            } else {
                trackLogin({ auth_method: 'google' });
            }

            await redirectAfterAuth(userId);
        } catch (error) {
            setStatusMessage({ type: 'error', text: getAuthErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <IonPage className="auth-page">
            <IonHeader className="auth-page__header">
                <IonToolbar>
                    <IonTitle>QuestSmith</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="auth-page__content">
                <FantasyFrame>
                    <section className="auth-hero">
                        <IonIcon
                            className="auth-hero__icon"
                            icon={lockClosedOutline}
                            aria-hidden="true"
                        />
                        <h1 className="auth-hero__title">Welcome, Adventurer</h1>
                        <div className="auth-hero__diamond" aria-hidden="true">◆</div>
                        <p className="auth-hero__subtitle">Sign in to continue your journey.</p>
                    </section>

                    <form className="auth-form" onSubmit={handleSignIn}>
                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="auth-email">Email</label>
                            <div className="auth-field__control">
                                <IonIcon className="auth-field__icon" icon={mailOutline} aria-hidden="true" />
                                <IonInput
                                    id="auth-email"
                                    className="auth-field__input"
                                    type="email"
                                    autocomplete="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onIonInput={(event) => setEmail(event.detail.value ?? '')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="auth-password">Password</label>
                            <div className="auth-field__control">
                                <IonIcon className="auth-field__icon" icon={lockClosedOutline} aria-hidden="true" />
                                <IonInput
                                    id="auth-password"
                                    className="auth-field__input"
                                    type={showPassword ? 'text' : 'password'}
                                    autocomplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onIonInput={(event) => setPassword(event.detail.value ?? '')}
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-field__toggle"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="auth-forgot"
                            onClick={handleForgotPassword}
                            disabled={submitting}
                        >
                            Forgot Password?
                        </button>

                        {statusMessage && (
                            <IonText>
                                <p
                                    role="alert"
                                    className={`auth-message auth-message--${statusMessage.type}`}
                                >
                                    {statusMessage.text}
                                </p>
                            </IonText>
                        )}

                        <div className="auth-actions">
                            <FantasyButton
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Please wait...' : 'Sign In'}
                            </FantasyButton>

                            <div className="auth-divider" aria-hidden="true">OR</div>

                            <FantasyButton
                                variant="secondary"
                                disabled={submitting}
                                onClick={handleCreateAccount}
                                icon={<IonIcon icon={personOutline} aria-hidden="true" />}
                            >
                                Create Account
                            </FantasyButton>
                        </div>
                    </form>

                    <div className="auth-oauth">
                        <FantasyButton
                            variant="google"
                            disabled={submitting}
                            onClick={handleGoogleSignIn}
                        >
                            Continue with Google
                        </FantasyButton>
                    </div>
                </FantasyFrame>
            </IonContent>
        </IonPage>
    );
};

export default AuthPage;
