import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { closeOutline, giftOutline } from 'ionicons/icons';
import React from 'react';
import FantasyButton from '../../shared/components/FantasyButton';
import type { InventoryItem } from '../inventory/inventoryTypes';
import { formatItemRarity } from '../inventory/inventoryService';
import './ItemRewardModal.css';

interface ItemRewardModalProps {
    isOpen: boolean;
    item: InventoryItem | null;
    onContinue: () => void;
}

const ItemRewardModal: React.FC<ItemRewardModalProps> = ({ isOpen, item, onContinue }) => (
    <IonModal
        isOpen={isOpen}
        onDidDismiss={onContinue}
        className="item-reward-modal"
        backdropDismiss={false}
    >
        <IonHeader className="item-reward-modal__header">
            <IonToolbar>
                <IonTitle>Item Acquired</IonTitle>
                <IonButton slot="end" fill="clear" onClick={onContinue} aria-label="Continue adventure">
                    <IonIcon icon={closeOutline} aria-hidden="true" />
                </IonButton>
            </IonToolbar>
        </IonHeader>
        <IonContent className="item-reward-modal__content">
            {item && (
                <div className="item-reward-modal__parchment">
                    <div className="item-reward-modal__eyebrow">
                        <IonIcon icon={giftOutline} aria-hidden="true" />
                        <span>Item Acquired</span>
                    </div>

                    <h2 className="item-reward-modal__name">{item.name}</h2>
                    <p className={`item-reward-modal__rarity item-reward-modal__rarity--${item.rarity}`}>
                        {formatItemRarity(item.rarity)}
                    </p>
                    <p className="item-reward-modal__description">{item.description}</p>

                    <FantasyButton variant="primary" onClick={onContinue}>
                        Continue Adventure
                    </FantasyButton>
                </div>
            )}
        </IonContent>
    </IonModal>
);

export default ItemRewardModal;
