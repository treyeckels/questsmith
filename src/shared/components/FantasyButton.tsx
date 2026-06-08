import { IonButton } from '@ionic/react';
import React from 'react';
import './FantasyButton.css';

type FantasyButtonVariant = 'primary' | 'secondary' | 'google';

interface FantasyButtonProps {
    children: React.ReactNode;
    variant?: FantasyButtonVariant;
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
}

const FantasyButton: React.FC<FantasyButtonProps> = ({
    children,
    variant = 'primary',
    type = 'button',
    disabled = false,
    onClick,
    icon,
}) => (
    <IonButton
        expand="block"
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`fantasy-button fantasy-button--${variant}`}
    >
        {icon && <span className="fantasy-button__icon">{icon}</span>}
        {children}
    </IonButton>
);

export default FantasyButton;
