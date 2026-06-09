import React from 'react';
import FantasyButton from '../../shared/components/FantasyButton';
import type { Character } from '../character/characterTypes';
import type { CombatState } from './combatTypes';
import './CombatPanel.css';

interface CombatPanelProps {
    combatState: CombatState;
    character: Character;
    isBusy: boolean;
    onAttack: () => void;
    onContinue?: () => void;
    victoryRewards?: {
        xp: number;
        gold: number;
    };
}

const formatRoll = (roll: CombatState['lastRoll']) => {
    if (!roll) {
        return null;
    }

    const outcomeLabel = roll.outcome === 'hit' ? 'Hit' : 'Miss';
    return `d20: ${roll.roll} + ${roll.modifier} = ${roll.total} (${outcomeLabel}${roll.damage > 0 ? `, ${roll.damage} damage` : ''})`;
};

const CombatPanel: React.FC<CombatPanelProps> = ({
    combatState,
    character,
    isBusy,
    onAttack,
    onContinue,
    victoryRewards,
}) => {
    const { enemy, phase, narration, lastRoll } = combatState;
    const rollSummary = formatRoll(lastRoll);

    return (
        <section className="combat-panel" aria-live="polite">
            <header className="combat-panel__header">
                <h3>Combat!</h3>
                <p className="combat-panel__subtitle">Roll the dice and strike your foe.</p>
            </header>

            <div className="combat-panel__stats">
                <div className="combat-panel__stat-card">
                    <span>{enemy.name}</span>
                    <strong>{enemy.hp} / {enemy.maxHp} HP</strong>
                </div>
                <div className="combat-panel__stat-card">
                    <span>{character.name}</span>
                    <strong>{character.hp} / {character.maxHp} HP</strong>
                </div>
            </div>

            {rollSummary && (
                <div className="combat-panel__roll">
                    <p className="combat-panel__roll-label">Last Roll</p>
                    <p className="combat-panel__roll-value">{rollSummary}</p>
                </div>
            )}

            <div className="combat-panel__narration">
                {narration.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={`combat-narration-${index}`}>{paragraph.trim()}</p>
                ))}
            </div>

            {phase === 'victory' && (
                <div className="combat-panel__victory">
                    <p><strong>Victory!</strong> The {enemy.name} is defeated.</p>
                    {victoryRewards && (
                        <p className="combat-panel__rewards">
                            +{victoryRewards.xp} XP · +{victoryRewards.gold} Gold
                        </p>
                    )}
                </div>
            )}

            <div className="combat-panel__actions">
                {phase === 'active' && (
                    <FantasyButton variant="primary" disabled={isBusy} onClick={onAttack}>
                        Attack
                    </FantasyButton>
                )}

                {phase === 'victory' && onContinue && (
                    <FantasyButton variant="primary" onClick={onContinue}>
                        Continue Adventure
                    </FantasyButton>
                )}
            </div>
        </section>
    );
};

export default CombatPanel;
