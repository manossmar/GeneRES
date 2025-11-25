import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFetchWithAuth } from '../hooks/useFetchWithAuth';

interface Notification {
    id: number;
    user_id: number;
    sender_id: number | null;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    read_at?: string;
    metadata?: any;
    sender_first_name?: string;
    sender_last_name?: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    loadNotifications: (filters?: { unread_only?: boolean; type?: string }) => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    bulkDelete: (ids: number[]) => Promise<void>;
    sendNotification: (recipientId: number, data: {
        type: string;
        title: string;
        message: string;
        link?: string;
    }) => Promise<void>;
    searchUsers: (query: string) => Promise<User[]>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const fetchWithAuth = useFetchWithAuth();

    const loadNotifications = async (filters?: { unread_only?: boolean; type?: string }) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters?.unread_only) params.append('unread_only', 'true');
            if (filters?.type) params.append('type', filters.type);

            const response = await fetchWithAuth(`/api/notifications?${params.toString()}`);
            if (response?.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const response = await fetchWithAuth(`/api/notifications/${id}/read`, {
                method: 'PUT',
            });

            if (response?.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetchWithAuth('/api/notifications/mark-all-read', {
                method: 'PUT',
            });

            if (response?.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            const response = await fetchWithAuth(`/api/notifications/${id}`, {
                method: 'DELETE',
            });

            if (response?.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                setUnreadCount(prev => {
                    const notification = notifications.find(n => n.id === id);
                    return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
                });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const bulkDelete = async (ids: number[]) => {
        try {
            const response = await fetchWithAuth('/api/notifications/bulk-delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });

            if (response?.ok) {
                const deletedUnread = notifications.filter(n => ids.includes(n.id) && !n.is_read).length;
                setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
                setUnreadCount(prev => Math.max(0, prev - deletedUnread));
            }
        } catch (error) {
            console.error('Error bulk deleting notifications:', error);
        }
    };

    const sendNotification = async (recipientId: number, data: {
        type: string;
        title: string;
        message: string;
        link?: string;
    }) => {
        try {
            const response = await fetchWithAuth('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient_id: recipientId,
                    ...data,
                }),
            });

            if (!response?.ok) {
                throw new Error('Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    };

    const searchUsers = async (query: string): Promise<User[]> => {
        if (!query || query.length < 2) return [];

        try {
            const response = await fetchWithAuth(`/api/user/search?query=${encodeURIComponent(query)}`);
            if (response?.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    };

    // Load notifications on mount and refresh every 30 seconds
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(() => loadNotifications(), 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                loadNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                bulkDelete,
                sendNotification,
                searchUsers,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}
