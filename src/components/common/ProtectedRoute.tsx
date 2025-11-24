import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/signin');
        }
    }, [isAuthenticated, token, navigate]);

    if (!isAuthenticated || !token) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
};

export default ProtectedRoute;
