import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { getPostAuthPath } from '../../features/game/gameService';
import LandingPage from '../../features/landing/LandingPage';
import { useAuth } from '../hooks/useAuth';
import LoadingState from './LoadingState';

const LandingRoute: React.FC = () => {
    const { user, loading } = useAuth();
    const [redirectTo, setRedirectTo] = useState<string | null>(null);
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            setRedirectTo(null);
            return;
        }

        let cancelled = false;
        setResolving(true);

        getPostAuthPath(user.uid)
            .then((path) => {
                if (!cancelled) {
                    setRedirectTo(path);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setResolving(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user, loading]);

    if (loading || (user && resolving)) {
        return <LoadingState />;
    }

    if (user && redirectTo) {
        return <Redirect to={redirectTo} />;
    }

    return <LandingPage />;
};

export default LandingRoute;
