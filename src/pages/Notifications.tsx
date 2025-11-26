import { useState } from 'react';
import DataTable from '../components/common/DataTable';
import Badge from '../components/ui/badge/Badge';
import { useNotifications } from '../context/NotificationsContext';
import SendNotificationModal from '../components/notifications/SendNotificationModal';

export default function Notifications() {
    const { notifications, markAsRead, deleteNotification, bulkDelete } = useNotifications();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getTypeColor = (type: string): "success" | "error" | "warning" | "light" => {
        switch (type) {
            case 'success': return 'success';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'light';
        }
    };

    const handleDelete = async (notification: any) => {
        await deleteNotification(notification.id);
    };

    const handleMarkAsRead = async (notification: any) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Send Notification
                    </button>
                </div>
            </div>

            <DataTable
                columns={[
                    {
                        key: 'type',
                        label: 'Type',
                        sortable: true,
                        resizable: true,
                        render: (notification: any) => (
                            <Badge variant="light" color={getTypeColor(notification.type)}>
                                {notification.type}
                            </Badge>
                        ),
                    },
                    { key: 'title', label: 'Title', sortable: true, resizable: true },
                    { key: 'message', label: 'Message', sortable: true, resizable: true },
                    {
                        key: 'sender_first_name',
                        label: 'From',
                        sortable: true,
                        resizable: true,
                        render: (notification: any) => {
                            if (notification.sender_first_name) {
                                return `${notification.sender_first_name} ${notification.sender_last_name || ''}`;
                            }
                            return 'System';
                        },
                    },
                    {
                        key: 'created_at',
                        label: 'Date',
                        sortable: true,
                        resizable: true,
                        render: (notification: any) => {
                            return new Date(notification.created_at).toLocaleString();
                        },
                    },
                    {
                        key: 'is_read',
                        label: 'Status',
                        sortable: true,
                        resizable: true,
                        render: (notification: any) => (
                            <Badge variant="light" color={notification.is_read ? 'light' : 'success'}>
                                {notification.is_read ? 'Read' : 'Unread'}
                            </Badge>
                        ),
                    },
                ]}
                data={notifications}
                actionButtons={[
                    {
                        label: 'Mark as Read',
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ),
                        onClick: handleMarkAsRead,
                        variant: 'default',
                    },
                    {
                        label: 'Delete',
                        icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        ),
                        onClick: handleDelete,
                        variant: 'danger',
                    },
                ]}
                enableSearch={true}
                enablePagination={true}
                enableShowEntries={true}
                enableFilter={true}
                enableAutoFilter={false}
                enableDownload={false}
                enableColumnMenu={true}
                enableSelection={false}
                initialSort={{ key: 'created_at', direction: 'desc' }}
            />

            <SendNotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
