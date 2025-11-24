import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const useFetchWithAuth = () => {
    const { token, logout } = useAuth();
    const { showNotification } = useNotification();

    const fetchWithAuth = useCallback(async (url: string, options: FetchOptions = {}) => {
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                // Token expired or invalid
                console.warn('Authentication failed (401). Logging out...');
                showNotification('error', 'Session Expired', 'Your session has expired. Please log in again.');
                logout();
                return null;
            }

            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }, [token, logout, showNotification]);

    return fetchWithAuth;
};
