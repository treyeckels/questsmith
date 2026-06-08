import {
    IonButton,
    IonContent,
    IonHeader,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import React from 'react';
import { signOut } from '../auth/authService';

const GamePage: React.FC = () => {
    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Your Adventure</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonText>
                    <h2>Resume Your Campaign</h2>
                    <p>The game screen is coming in later epics. Your saved adventure will load here.</p>
                </IonText>
                <IonButton expand="block" fill="outline" onClick={handleSignOut}>
                    Sign Out
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default GamePage;
