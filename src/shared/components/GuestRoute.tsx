import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { getPostAuthPath } from '../../features/game/gameService';
import { useAuth } from '../hooks/useAuth';
import LoadingState from './LoadingState';

interface GuestRouteProps {
    children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const [redirectTo, setRedirectTo] = useState<string | null>(null);
    const [checkingGame, setCheckingGame] = useState(false);

    useEffect(() => {
        if (loading || !user) {
            setRedirectTo(null);
            return;
        }

        let cancelled = false;
        setCheckingGame(true);

        getPostAuthPath(user.uid)
            .then((path) => {
                if (!cancelled) {
                    setRedirectTo(path);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setCheckingGame(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [user, loading]);

    if (loading || checkingGame) {
        return <LoadingState />;
    }

    if (user && redirectTo) {
        return <Redirect to={redirectTo} />;
    }

    return <>{children}</>;
};

export default GuestRoute;
