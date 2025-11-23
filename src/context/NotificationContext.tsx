import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    header: string;
    text: string;
    buttonText?: string;
    buttonLink?: string;
    duration?: number;
    isConfirmation?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface NotificationContextType {
    showNotification: (
        type: NotificationType,
        header: string,
        text: string,
        options?: { buttonText?: string; buttonLink?: string; duration?: number }
    ) => void;
    showConfirmation: (
        header: string,
        text: string,
        onConfirm: () => void,
        onCancel?: () => void
    ) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback(
        (
            type: NotificationType,
            header: string,
            text: string,
            options: { buttonText?: string; buttonLink?: string; duration?: number } = {}
        ) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                id,
                type,
                header,
                text,
                ...options,
            };

            setNotifications((prev) => [...prev, newNotification]);
        },
        []
    );

    const showConfirmation = useCallback(
        (
            header: string,
            text: string,
            onConfirm: () => void,
            onCancel?: () => void
        ) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = {
                id,
                type: 'warning',
                header,
                text,
                isConfirmation: true,
                onConfirm,
                onCancel,
            };

            setNotifications((prev) => [...prev, newNotification]);
        },
        []
    );

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirmation, removeNotification }}>
            {children}
            <div className="fixed top-5 right-5 z-999999 flex flex-col gap-4">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const NotificationItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({
    notification,
    onDismiss,
}) => {
    const { type, header, text, buttonText, buttonLink, duration, isConfirmation, onConfirm, onCancel } = notification;
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Don't auto-dismiss confirmations
        if (isConfirmation) return;

        const timer = setTimeout(() => {
            setIsExiting(true);
        }, (duration || 3) * 1000);

        return () => clearTimeout(timer);
    }, [duration, isConfirmation]);

    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 500); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [isExiting, onDismiss]);

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        // Wait for success notification to complete its full cycle (3s display + 0.5s exit animation - 0.5s overlap)
        // Then both notifications will slide out together
        setTimeout(() => {
            setIsExiting(true);
        }, 3000);
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        setIsExiting(true);
    };

    let backgroundColor, borderColor, color, icon;

    switch (type) {
        case 'success':
            backgroundColor = '#163638';
            borderColor = 'var(--color-success-500)';
            color = 'var(--color-success-700)';
            icon = (
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.70186 12.0001C3.70186 7.41711 7.41711 3.70186 12.0001 3.70186C16.5831 3.70186 20.2984 7.41711 20.2984 12.0001C20.2984 16.5831 16.5831 20.2984 12.0001 20.2984C7.41711 20.2984 3.70186 16.5831 3.70186 12.0001ZM12.0001 1.90186C6.423 1.90186 1.90186 6.423 1.90186 12.0001C1.90186 17.5772 6.423 22.0984 12.0001 22.0984C17.5772 22.0984 22.0984 17.5772 22.0984 12.0001C22.0984 6.423 17.5772 1.90186 12.0001 1.90186ZM15.6197 10.7395C15.9712 10.388 15.9712 9.81819 15.6197 9.46672C15.2683 9.11525 14.6984 9.11525 14.347 9.46672L11.1894 12.6243L9.6533 11.0883C9.30183 10.7368 8.73198 10.7368 8.38051 11.0883C8.02904 11.4397 8.02904 12.0096 8.38051 12.3611L10.553 14.5335C10.7217 14.7023 10.9507 14.7971 11.1894 14.7971C11.428 14.7971 11.657 14.7023 11.8257 14.5335L15.6197 10.7395Z" fill="" />
                </svg>
            );
            break;
        case 'warning':
            backgroundColor = '#393029';
            borderColor = 'var(--color-warning-500)';
            color = 'var(--color-warning-700)';
            icon = (
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.6501 12.0001C3.6501 7.38852 7.38852 3.6501 12.0001 3.6501C16.6117 3.6501 20.3501 7.38852 20.3501 12.0001C20.3501 16.6117 16.6117 20.3501 12.0001 20.3501C7.38852 20.3501 3.6501 16.6117 3.6501 12.0001ZM12.0001 1.8501C6.39441 1.8501 1.8501 6.39441 1.8501 12.0001C1.8501 17.6058 6.39441 22.1501 12.0001 22.1501C17.6058 22.1501 22.1501 17.6058 22.1501 12.0001C22.1501 6.39441 17.6058 1.8501 12.0001 1.8501ZM10.9992 7.52517C10.9992 8.07746 11.4469 8.52517 11.9992 8.52517H12.0002C12.5525 8.52517 13.0002 8.07746 13.0002 7.52517C13.0002 6.97289 12.5525 6.52517 12.0002 6.52517H11.9992C11.4469 6.52517 10.9992 6.97289 10.9992 7.52517ZM12.0002 17.3715C11.586 17.3715 11.2502 17.0357 11.2502 16.6215V10.945C11.2502 10.5308 11.586 10.195 12.0002 10.195C12.4144 10.195 12.7502 10.5308 12.7502 10.945V16.6215C12.7502 17.0357 12.4144 17.3715 12.0002 17.3715Z" fill="" />
                </svg>
            );
            break;
        case 'error':
            backgroundColor = '#382530';
            borderColor = 'var(--color-error-500)';
            color = 'var(--color-error-700)';
            icon = (
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="#F04438" />
                </svg>
            );
            break;
        case 'info':
            backgroundColor = '#15334B';
            borderColor = 'var(--color-blue-light-500)';
            color = 'var(--color-blue-light-700)';
            icon = (
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.6501 11.9996C3.6501 7.38803 7.38852 3.64961 12.0001 3.64961C16.6117 3.64961 20.3501 7.38803 20.3501 11.9996C20.3501 16.6112 16.6117 20.3496 12.0001 20.3496C7.38852 20.3496 3.6501 16.6112 3.6501 11.9996ZM12.0001 1.84961C6.39441 1.84961 1.8501 6.39392 1.8501 11.9996C1.8501 17.6053 6.39441 22.1496 12.0001 22.1496C17.6058 22.1496 22.1501 17.6053 22.1501 11.9996C22.1501 6.39392 17.6058 1.84961 12.0001 1.84961ZM10.9992 7.52468C10.9992 8.07697 11.4469 8.52468 11.9992 8.52468H12.0002C12.5525 8.52468 13.0002 8.07697 13.0002 7.52468C13.0002 6.9724 12.5525 6.52468 12.0002 6.52468H11.9992C11.4469 6.52468 10.9992 6.9724 10.9992 7.52468ZM12.0002 17.371C11.586 17.371 11.2502 17.0352 11.2502 16.621V10.9445C11.2502 10.5303 11.586 10.1945 12.0002 10.1945C12.4144 10.1945 12.7502 10.5303 12.7502 10.9445V16.621C12.7502 17.0352 12.4144 17.371 12.0002 17.371Z" fill="#0BA5EC" />
                </svg>
            );
            break;
    }

    return (
        <div
            className={`rounded-xl border p-4 ${isExiting ? 'notification-exit' : 'notification-enter'}`}
            style={{
                backgroundColor,
                borderColor,
                color,
                marginBottom: '0.085rem',
            }}
        >
            <div className="flex items-start gap-3">
                <div className="-mt-0.5" style={{ color: borderColor }}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h4 className="mb-1 text-sm font-semibold text-white">{header}</h4>
                    <p className="text-sm text-white">{text}</p>
                    {buttonText && buttonLink && !isConfirmation && (
                        <a
                            href={buttonLink}
                            className="mt-3 inline-block text-sm font-medium text-white underline"
                        >
                            {buttonText}
                        </a>
                    )}
                    {isConfirmation && (
                        <div className="mt-3 flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
