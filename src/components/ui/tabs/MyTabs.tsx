import React, { useState } from 'react';

interface Tab {
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
}

interface MyTabsProps {
    tabs: Tab[];
    defaultTab?: number;
    orientation?: 'vertical' | 'horizontal';
}

const MyTabs: React.FC<MyTabsProps> = ({ tabs, defaultTab = 0, orientation = 'vertical' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className={`flex ${orientation === 'vertical' ? 'flex-col lg:flex-row' : 'flex-col'} gap-6`}>
            {/* Tab List */}
            <div className={`${orientation === 'vertical' ? 'w-full lg:w-1/4' : 'w-full'}`}>
                <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row overflow-x-auto'} gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700`}>
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`
                                flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                                ${activeTab === index
                                    ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
                                }
                                ${orientation === 'horizontal' ? 'whitespace-nowrap' : 'w-full'}
                            `}
                        >
                            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className={`${orientation === 'vertical' ? 'w-full lg:w-3/4' : 'w-full'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]">
                    {tabs[activeTab].content}
                </div>
            </div>
        </div>
    );
};

export default MyTabs;
