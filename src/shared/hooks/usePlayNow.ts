import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { trackPlayNowClicked } from '../../features/analytics/analyticsService';
import { getPostAuthPath } from '../../features/game/gameService';
import { useAuth } from './useAuth';

export function usePlayNow() {
    const history = useHistory();
    const { user } = useAuth();

    const playNow = useCallback(async () => {
        trackPlayNowClicked();

        if (user?.uid) {
            const path = await getPostAuthPath(user.uid);
            history.push(path);
            return;
        }

        history.push('/login');
    }, [history, user?.uid]);

    return playNow;
}
