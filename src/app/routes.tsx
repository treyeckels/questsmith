import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import React from 'react';
import AuthPage from '../features/auth/AuthPage';
import CampaignCompletePage from '../features/campaign/CampaignCompletePage';
import CampaignGenerationPage from '../features/campaign/CampaignGenerationPage';
import CampaignSummaryPage from '../features/campaign/CampaignSummaryPage';
import DefeatPage from '../features/campaign/DefeatPage';
import NewAdventurePage from '../features/campaign/NewAdventurePage';
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
        <Route exact path="/campaign/generate">
            <ProtectedRoute>
                <CampaignGenerationPage />
            </ProtectedRoute>
        </Route>
        <Route exact path="/campaign/complete">
            <ProtectedRoute>
                <CampaignCompletePage />
            </ProtectedRoute>
        </Route>
        <Route exact path="/campaign/defeat">
            <ProtectedRoute>
                <DefeatPage />
            </ProtectedRoute>
        </Route>
        <Route exact path="/campaign/summary">
            <ProtectedRoute>
                <CampaignSummaryPage />
            </ProtectedRoute>
        </Route>
        <Route exact path="/campaign/new">
            <ProtectedRoute>
                <NewAdventurePage />
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
