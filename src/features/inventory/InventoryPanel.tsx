import {
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { bagOutline, closeOutline } from 'ionicons/icons';
import React from 'react';
import type { InventoryItem } from './inventoryTypes';
import { formatItemRarity, formatItemType } from './inventoryService';
import './InventoryPanel.css';

interface InventoryPanelProps {
    isOpen: boolean;
    items: InventoryItem[];
    onClose: () => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, items, onClose }) => (
    <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className="inventory-panel"
        breakpoints={[0, 0.75, 0.92]}
        initialBreakpoint={0.92}
    >
        <IonHeader className="inventory-panel__header">
            <IonToolbar>
                <IonTitle>
                    <IonIcon icon={bagOutline} aria-hidden="true" />
                    Inventory
                </IonTitle>
                <IonButton slot="end" fill="clear" onClick={onClose} aria-label="Close inventory">
                    <IonIcon icon={closeOutline} aria-hidden="true" />
                </IonButton>
            </IonToolbar>
        </IonHeader>
        <IonContent className="inventory-panel__content">
            <div className="inventory-panel__parchment">
                {items.length === 0 ? (
                    <div className="inventory-panel__empty">
                        <IonIcon icon={bagOutline} aria-hidden="true" />
                        <h2>Your pack is empty</h2>
                        <p>Items you discover on your adventure will appear here.</p>
                    </div>
                ) : (
                    <ul className="inventory-panel__list">
                        {items.map((item) => (
                            <li key={item.id} className="inventory-panel__item">
                                <div className="inventory-panel__item-header">
                                    <h3>{item.name}</h3>
                                    <span
                                        className={`inventory-panel__rarity inventory-panel__rarity--${item.rarity}`}
                                    >
                                        {formatItemRarity(item.rarity)}
                                    </span>
                                </div>
                                <p className="inventory-panel__type">{formatItemType(item.type)}</p>
                                <p className="inventory-panel__description">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </IonContent>
    </IonModal>
);

export default InventoryPanel;
