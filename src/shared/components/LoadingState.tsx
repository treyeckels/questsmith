import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import React from 'react';

const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
    <IonPage>
        <IonContent className="ion-padding ion-text-center loading-state">
            <IonSpinner name="crescent" />
            <IonText color="medium">
                <p>{message}</p>
            </IonText>
        </IonContent>
    </IonPage>
);

export default LoadingState;
