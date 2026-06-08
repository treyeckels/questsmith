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

const CharacterCreationPage: React.FC = () => {
    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Character Creation</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonText>
                    <h2>Create Your Hero</h2>
                    <p>Character creation is coming in Epic 2. For now, you are signed in and ready to begin.</p>
                </IonText>
                <IonButton expand="block" fill="outline" onClick={handleSignOut}>
                    Sign Out
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default CharacterCreationPage;
