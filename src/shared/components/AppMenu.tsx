import {
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonList,
    IonPopover,
} from '@ionic/react';
import { chatboxOutline, menuOutline } from 'ionicons/icons';
import React, { useId, useState } from 'react';
import { openFeedbackForm } from '../../features/feedback/feedbackService';
import './AppMenu.css';

const AppMenu: React.FC = () => {
    const triggerId = useId();
    const [isOpen, setIsOpen] = useState(false);

    const handleLeaveFeedback = () => {
        setIsOpen(false);
        openFeedbackForm();
    };

    return (
        <>
            <IonButton
                id={triggerId}
                className="app-menu__trigger"
                fill="clear"
                aria-label="Open menu"
                onClick={() => setIsOpen(true)}
            >
                <IonIcon icon={menuOutline} aria-hidden="true" />
            </IonButton>
            <IonPopover
                className="app-menu"
                trigger={triggerId}
                isOpen={isOpen}
                onDidDismiss={() => setIsOpen(false)}
                dismissOnSelect
            >
                <IonContent className="app-menu__content">
                    <IonList className="app-menu__list" lines="none">
                        <IonItem
                            className="app-menu__item"
                            button
                            detail={false}
                            onClick={handleLeaveFeedback}
                        >
                            <IonIcon slot="start" icon={chatboxOutline} aria-hidden="true" />
                            Leave Feedback
                        </IonItem>
                    </IonList>
                </IonContent>
            </IonPopover>
        </>
    );
};

export default AppMenu;
