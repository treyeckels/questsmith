import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
    handleGoogleRedirectResult,
    signIn,
    signInWithGoogle,
    signUp,
} from './authService';
import { getAuthErrorMessage } from './authErrors';
import { AuthMode } from './authTypes';
import { getPostAuthPath } from '../game/gameService';
import './AuthPage.css';

const AuthPage: React.FC = () => {
    const history = useHistory();
    const [mode, setMode] = useState<AuthMode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const redirectAfterAuth = async (userId: string) => {
        const path = await getPostAuthPath(userId);
        history.replace(path);
    };

    useEffect(() => {
        let cancelled = false;

        handleGoogleRedirectResult()
            .then(async (result) => {
                if (cancelled || !result?.user?.uid) {
                    return;
                }
                await redirectAfterAuth(result.user.uid);
            })
            .catch((error) => {
                if (!cancelled) {
                    setErrorMessage(getAuthErrorMessage(error));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [history]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setErrorMessage('Please enter both email and password.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);

        try {
            const credentials = { email: trimmedEmail, password };
            const result = mode === 'signUp'
                ? await signUp(credentials)
                : await signIn(credentials);

            const userId = result.user?.uid;
            if (!userId) {
                throw new Error('Authentication succeeded without a user.');
            }

            await redirectAfterAuth(userId);
        } catch (error) {
            setErrorMessage(getAuthErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setErrorMessage(null);
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

            await redirectAfterAuth(userId);
        } catch (error) {
            setErrorMessage(getAuthErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>QuestSmith</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding auth-page">
                <div className="auth-page__intro">
                    <IonText>
                        <h1>Begin Your Adventure</h1>
                        <p>Sign in or create an account to save your campaign progress.</p>
                    </IonText>
                </div>

                <IonSegment
                    value={mode}
                    onIonChange={(event) => {
                        setMode(event.detail.value as AuthMode);
                        setErrorMessage(null);
                    }}
                >
                    <IonSegmentButton value="signIn">
                        <IonLabel>Sign In</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="signUp">
                        <IonLabel>Sign Up</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <form onSubmit={handleSubmit}>
                    <IonList inset>
                        <IonItem>
                            <IonInput
                                label="Email"
                                labelPlacement="stacked"
                                type="email"
                                autocomplete="email"
                                value={email}
                                onIonInput={(event) => setEmail(event.detail.value ?? '')}
                                required
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                                label="Password"
                                labelPlacement="stacked"
                                type="password"
                                autocomplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                                value={password}
                                onIonInput={(event) => setPassword(event.detail.value ?? '')}
                                required
                            />
                        </IonItem>
                    </IonList>

                    {errorMessage && (
                        <IonText color="danger" className="auth-page__error">
                            <p role="alert">{errorMessage}</p>
                        </IonText>
                    )}

                    <IonButton
                        expand="block"
                        type="submit"
                        className="auth-page__submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Please wait...'
                            : mode === 'signUp'
                                ? 'Create Account'
                                : 'Sign In'}
                    </IonButton>
                </form>

                <div className="auth-page__divider">
                    <span>or</span>
                </div>

                <IonButton
                    expand="block"
                    fill="outline"
                    className="auth-page__google"
                    disabled={submitting}
                    onClick={handleGoogleSignIn}
                >
                    Continue with Google
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default AuthPage;
