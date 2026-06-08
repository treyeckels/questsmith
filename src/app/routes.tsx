import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import React from 'react';
import AuthPage from '../features/auth/AuthPage';
import CharacterCreationPage from '../features/character/CharacterCreationPage';
import GamePage from '../features/game/GamePage';
import GuestRoute from '../shared/components/GuestRoute';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import RootRedirect from '../shared/components/RootRedirect';

const AppRoutes: React.FC = () => (
    <IonRouterOutlet>
        <Route exact path="/login">
            <GuestRoute>
                <AuthPage />
            </GuestRoute>
        </Route>
        <Route exact path="/character/create">
            <ProtectedRoute>
                <CharacterCreationPage />
            </ProtectedRoute>
        </Route>
        <Route exact path="/game">
            <ProtectedRoute>
                <GamePage />
            </ProtectedRoute>
        </Route>
        <Route exact path="/">
            <RootRedirect />
        </Route>
    </IonRouterOutlet>
);

export default AppRoutes;
