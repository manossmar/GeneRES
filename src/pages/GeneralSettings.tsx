import PageMeta from '../components/common/PageMeta';
import MyTabs from '../components/ui/tabs/MyTabs';

export default function GeneralSettings() {
    const tabs = [
        {
            label: "Profile",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
                    <p className="text-gray-500 dark:text-gray-400">Manage your public profile details.</p>
                </div>
            )
        },
        {
            label: "Account",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
                    <p className="text-gray-500 dark:text-gray-400">Update your account information and security.</p>
                </div>
            )
        },
        {
            label: "Notifications",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                    <p className="text-gray-500 dark:text-gray-400">Choose what notifications you want to receive.</p>
                </div>
            )
        },
        {
            label: "Appearance",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance Settings</h3>
                    <p className="text-gray-500 dark:text-gray-400">Customize the look and feel of the application.</p>
                </div>
            )
        }
    ];

    return (
        <>
            <PageMeta
                title="General Settings"
                description="Manage your application settings"
            />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h2>
                <MyTabs tabs={tabs} orientation="vertical" />
            </div>
        </>
    );
}
