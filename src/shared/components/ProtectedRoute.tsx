import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingState from './LoadingState';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingState />;
    }

    if (!user) {
        return <Redirect to="/login" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
