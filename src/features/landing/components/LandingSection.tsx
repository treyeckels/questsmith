import React from 'react';

interface LandingSectionProps {
    id?: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

const LandingSection: React.FC<LandingSectionProps> = ({
    id,
    title,
    subtitle,
    children,
    className = '',
}) => (
    <section id={id} className={`landing-section ${className}`.trim()}>
        <div className="landing-section__inner">
            <header className="landing-section__header">
                <h2 className="landing-section__title">{title}</h2>
                {subtitle && <p className="landing-section__subtitle">{subtitle}</p>}
            </header>
            {children}
        </div>
    </section>
);

export default LandingSection;
