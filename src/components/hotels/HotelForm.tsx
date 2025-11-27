import { useState, useEffect } from 'react';
import { HotelFormData, RoomDetail, MediaFile, CommunicationDetail } from '../../types/hotel';
import { initialData, ROOM_VIEWS, BED_TYPES, ROOM_LOCATIONS } from './hotelFormUtils';

// Helper UI components
const InputGroup = ({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {children}
    </div>
);

const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 ${className}`}
        {...props}
    />
);

const TextArea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 min-h-[100px] ${className}`}
        {...props}
    />
);

const Select = ({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select
            className={`w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 ${className}`}
            {...props}
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
);

// Image preview component using FileReader for robustness
const ImagePreview = ({ file, alt, className }: { file: File; alt: string; className?: string }) => {
    const [src, setSrc] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!file || !(file instanceof Blob)) {
            setError(true);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setSrc(reader.result as string);
        reader.onerror = () => setError(true);
        reader.readAsDataURL(file);
        return () => {
            // No cleanup needed for DataURL
        };
    }, [file]);

    if (error) {
        return <div className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs ${className}`}>No Preview</div>;
    }
    if (!src) {
        return <div className={`bg-gray-200 animate-pulse ${className}`} />;
    }
    return <img src={src} alt={alt} className={className} />;
};

interface HotelFormProps {
    initialData?: HotelFormData | null;
    onClose: () => void;
    onSubmit?: (data: HotelFormData) => void;
}

export default function HotelForm({ initialData: propInitialData, onClose, onSubmit }: HotelFormProps) {
    // State
    const [activeTab, setActiveTab] = useState('identity');
    const [formData, setFormData] = useState<HotelFormData>(initialData);

    useEffect(() => {
        if (propInitialData) {
            setFormData(propInitialData);
        } else {
            setFormData(initialData);
        }
    }, [propInitialData]);
    const [tabOverrides, setTabOverrides] = useState<Record<string, boolean>>({});
    const [locationSearch, setLocationSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [collapsedRooms, setCollapsedRooms] = useState<Record<number, boolean>>({});

    // Generic change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-fill location search when entering Main Details
    useEffect(() => {
        if (activeTab === 'location' && !locationSearch) {
            const parts = [formData.name, formData.address1, formData.cityName, formData.country].filter(Boolean);
            if (parts.length > 0) setLocationSearch(parts.join(', '));
        }
    }, [activeTab, formData.name, formData.address1, formData.cityName, formData.country, locationSearch]);

    // Location search using Nominatim
    const handleLocationSearch = async () => {
        if (!locationSearch.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                setFormData(prev => ({ ...prev, latitude: data[0].lat, longitude: data[0].lon }));
            } else {
                alert('Location not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Error searching location:', error);
            alert('Error searching for location. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Media upload (hotel images)
    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newMedia: MediaFile[] = Array.from(files).map((file, idx) => ({
                file,
                isDefault: formData.media.length === 0 && idx === 0,
            }));
            setFormData(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
        }
    };

    const setDefaultImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            media: prev.media.map((m, i) => ({ ...m, isDefault: i === index })),
        }));
    };

    const removeMedia = (index: number) => {
        setFormData(prev => {
            const newMedia = prev.media.filter((_, i) => i !== index);
            if (prev.media[index]?.isDefault && newMedia.length > 0) newMedia[0].isDefault = true;
            return { ...prev, media: newMedia };
        });
    };

    // Room photo upload
    const handleRoomPhotoUpload = (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const currentMedia = formData.rooms[roomIndex].media || [];
            const newMedia: MediaFile[] = Array.from(files).map((file, idx) => ({
                file,
                isDefault: currentMedia.length === 0 && idx === 0,
            }));
            updateRoom(roomIndex, 'media', [...currentMedia, ...newMedia]);
        }
    };

    const setRoomDefaultImage = (roomIndex: number, photoIndex: number) => {
        const room = formData.rooms[roomIndex];
        if (!room.media) return;
        const newMedia = room.media.map((m, i) => ({ ...m, isDefault: i === photoIndex }));
        updateRoom(roomIndex, 'media', newMedia);
    };

    const removeRoomMedia = (roomIndex: number, photoIndex: number) => {
        const room = formData.rooms[roomIndex];
        if (!room.media) return;
        const newMedia = room.media.filter((_, i) => i !== photoIndex);
        if (room.media[photoIndex]?.isDefault && newMedia.length > 0) newMedia[0].isDefault = true;
        updateRoom(roomIndex, 'media', newMedia);
    };

    // Communication helpers
    const addCommunication = () => {
        setFormData(prev => ({
            ...prev,
            communicationDetails: [...prev.communicationDetails, { department: '', contactPerson: '', phone: '', email: '' }],
        }));
    };

    const updateCommunication = (index: number, field: keyof CommunicationDetail, value: string) => {
        const newDetails = [...formData.communicationDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };
        setFormData(prev => ({ ...prev, communicationDetails: newDetails }));
    };

    const removeCommunication = (index: number) => {
        setFormData(prev => ({
            ...prev,
            communicationDetails: prev.communicationDetails.filter((_, i) => i !== index),
        }));
    };

    // Room helpers
    const addRoom = () => {
        setFormData(prev => ({
            ...prev,
            rooms: [...prev.rooms, {
                name: '',
                type: 'Standard',
                view: ROOM_VIEWS[0],
                bedType: BED_TYPES[0],
                quantity: '1',
                location: ROOM_LOCATIONS[0],
                size: '',
                smokingAllowed: false,
                mainDescription: '',
                facilities: '',
                media: [],
            }],
        }));
    };

    const updateRoom = (index: number, field: keyof RoomDetail, value: any) => {
        const newRooms = [...formData.rooms];
        newRooms[index] = { ...newRooms[index], [field]: value };
        setFormData(prev => ({ ...prev, rooms: newRooms }));
    };

    const removeRoom = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rooms: prev.rooms.filter((_, i) => i !== index),
        }));
    };

    // Tab navigation order
    const tabOrder = ['identity', 'location', 'rooms', 'contact', 'details', 'amenities', 'media'];
    const currentTabIndex = tabOrder.indexOf(activeTab);

    const goToNextTab = () => {
        if (currentTabIndex < tabOrder.length - 1) setActiveTab(tabOrder[currentTabIndex + 1]);
    };

    const goToPreviousTab = () => {
        if (currentTabIndex > 0) setActiveTab(tabOrder[currentTabIndex - 1]);
    };

    // Completion calculation
    const calculateTabCompletion = (tabId: string): number => {
        let totalFields = 0;
        let completedFields = 0;

        const isFieldComplete = (value: any): boolean => {
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return true;
            if (Array.isArray(value)) return value.length > 0;
            return false;
        };

        switch (tabId) {
            case 'identity':
                const identityFields = [
                    formData.name, formData.code, formData.typeDescription, formData.locationDescription,
                    formData.architectureStyle, formData.url, formData.officialRating,
                    formData.ratingCommercial, formData.googleRating
                ];
                totalFields = identityFields.length;
                completedFields = identityFields.filter(isFieldComplete).length;
                break;

            case 'location':
                const locationFields = [
                    formData.address1, formData.cityName, formData.prefectureName, formData.country,
                    formData.zip, formData.airportCode, formData.latitude, formData.longitude
                ];
                totalFields = locationFields.length;
                completedFields = locationFields.filter(isFieldComplete).length;
                break;

            case 'contact':
                const contactFields = [formData.telephone, formData.email];
                totalFields = contactFields.length + 1; // +1 for communication details
                completedFields = contactFields.filter(isFieldComplete).length;
                if (formData.communicationDetails.length > 0) completedFields++;
                break;

            case 'details':
                const detailFields = [
                    formData.description, formData.detailedDescription,
                    formData.additionalInformation, formData.numBuildings,
                    formData.numRooms, formData.checkInTime, formData.checkOutTime,
                    formData.yearOpened, formData.yearRenovated, formData.yearRoomRenovated
                ];
                totalFields = detailFields.length;
                completedFields = detailFields.filter(isFieldComplete).length;
                break;

            case 'rooms':
                if (formData.rooms.length === 0) return 0;
                let totalRoomFields = 0;
                let completedRoomFields = 0;
                formData.rooms.forEach(room => {
                    const roomFields = [
                        room.name, room.view, room.bedType, room.location,
                        room.quantity, room.size, room.mainDescription, room.facilities
                    ];
                    totalRoomFields += roomFields.length + 1; // +1 for media
                    completedRoomFields += roomFields.filter(f => isFieldComplete(f)).length;
                    if (room.media && room.media.length > 0) completedRoomFields++;
                });
                return totalRoomFields > 0 ? Math.round((completedRoomFields / totalRoomFields) * 100) : 0;

            case 'amenities':
                const amenitiesFields = [
                    formData.facilities, formData.searchTags,
                    formData.referencePoints, formData.nearbyPoints
                ];
                totalFields = amenitiesFields.length;
                completedFields = amenitiesFields.filter(isFieldComplete).length;
                break;

            case 'media':
                return (formData.media && formData.media.length > 0) ? 100 : 0;
        }

        return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    };

    const toggleTabOverride = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTabOverrides(prev => ({ ...prev, [tabId]: !prev[tabId] }));
    };

    // Completion Indicator component
    const CompletionIndicator = ({ percentage, tabId, isOverridden }: { percentage: number; tabId: string; isOverridden: boolean }) => {
        const isComplete = percentage === 100;
        const size = 24;
        const strokeWidth = 2.5;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        const getTextColor = () => {
            if (percentage === 100) return 'text-green-600 dark:text-green-400';
            if (percentage >= 67) return 'text-green-600 dark:text-green-400';
            if (percentage >= 34) return 'text-yellow-600 dark:text-yellow-400';
            return 'text-red-600 dark:text-red-400';
        };
        if (isComplete) {
            return (
                <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={e => toggleTabOverride(tabId, e)} title="Completed">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[9px] font-semibold text-green-600 dark:text-green-400">{percentage}%</span>
                </div>
            );
        }
        if (isOverridden) {
            return (
                <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={e => toggleTabOverride(tabId, e)} title="Click to show progress">
                    <div className="relative">
                        <svg width={size} height={size} className="transform -rotate-90">
                            <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} fill="#22c55e" />
                            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ef4444" strokeWidth={strokeWidth} />
                            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#22c55e" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                    <span className={`text-[9px] font-semibold ${getTextColor()}`}>{percentage}%</span>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-80 transition-colors" onClick={e => toggleTabOverride(tabId, e)} title="Click to mark as complete">
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ef4444" strokeWidth={strokeWidth} />
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#22c55e" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                </svg>
                <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-400">{percentage}%</span>
            </div>
        );
    };

    // Tabs definition
    const tabs = [
        { id: 'identity', label: 'Main Details', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { id: 'location', label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
        { id: 'rooms', label: 'Rooms', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z' },
        { id: 'details', label: 'Details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'amenities', label: 'Amenities', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { id: 'media', label: 'Media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
        onClose();
    };

    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-5">
                <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Add or edit Hotels</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSubmit}
                        className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Save Hotel
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100vh-200px)] overflow-hidden">
                {/* Sidebar Tabs */}
                <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 border-l-4 border-brand-500'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800 border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                                    </svg>
                                    <div className="flex flex-col items-start text-left">
                                        <span>{tab.label}</span>
                                        {tab.id === 'media' && formData.media.length > 0 && (
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                                                {formData.media.length} photo{formData.media.length === 1 ? '' : 's'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <CompletionIndicator percentage={calculateTabCompletion(tab.id)} tabId={tab.id} isOverridden={!!tabOverrides[tab.id]} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Identity (Main Details) */}
                    {activeTab === 'identity' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <InputGroup label="Hotel Name"><Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Grand Resort & Spa" /></InputGroup>
                                <InputGroup label="Hotel Code"><Input name="code" value={formData.code} onChange={handleChange} placeholder="e.g. GRS-001" /></InputGroup>
                                <InputGroup label="Type"><Select name="typeDescription" value={formData.typeDescription} onChange={handleChange}><option>Hotel</option><option>Apartment</option><option>Bungalow</option><option>Villa</option><option>Resort</option><option>Hostel</option></Select></InputGroup>
                                <InputGroup label="Location Category"><Select name="locationDescription" value={formData.locationDescription} onChange={handleChange}><option>City</option><option>Beach</option><option>Mountain</option><option>Countryside</option><option>Island</option></Select></InputGroup>
                                <InputGroup label="Architecture Style"><Input name="architectureStyle" value={formData.architectureStyle} onChange={handleChange} placeholder="e.g. Modern, Art Deco" /></InputGroup>
                                <InputGroup label="Website URL"><Input name="url" value={formData.url} onChange={handleChange} placeholder="https://" /></InputGroup>
                                <InputGroup label="Official Rating"><Input name="officialRating" value={formData.officialRating} onChange={handleChange} placeholder="e.g. 5 Stars" /></InputGroup>
                                <InputGroup label="Commercial Rating"><Input name="ratingCommercial" value={formData.ratingCommercial} onChange={handleChange} placeholder="e.g. Luxury" /></InputGroup>
                                <InputGroup label="Google Rating"><Input name="googleRating" type="number" step="0.1" value={formData.googleRating} onChange={handleChange} placeholder="e.g. 4.8" /></InputGroup>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} disabled={currentTabIndex === 0} className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium ${currentTabIndex === 0 ? 'cursor-not-allowed text-gray-400 bg-gray-200 dark:bg-gray-800 dark:text-gray-600' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}> <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">Next <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {activeTab === 'location' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <InputGroup label="Street Address"><Input name="address1" value={formData.address1} onChange={handleChange} placeholder="123 Seaside Blvd" /></InputGroup>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <InputGroup label="City"><Input name="cityName" value={formData.cityName} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Prefecture / State"><Input name="prefectureName" value={formData.prefectureName} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Country"><Input name="country" value={formData.country} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Zip / Postal Code"><Input name="zip" value={formData.zip} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Airport Code"><Input name="airportCode" value={formData.airportCode} onChange={handleChange} placeholder="e.g. ATH" /></InputGroup>
                            </div>
                            {/* Separator */}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-6" />
                            {/* Coordinates */}
                            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Coordinates</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <InputGroup label="Latitude"><Input name="latitude" value={formData.latitude} onChange={handleChange} placeholder="e.g. 37.9838" /></InputGroup>
                                <InputGroup label="Longitude"><Input name="longitude" value={formData.longitude} onChange={handleChange} placeholder="e.g. 23.7275" /></InputGroup>
                            </div>
                            {/* Search Location */}
                            <InputGroup label="Search Location">
                                <div className="flex gap-3">
                                    <Input value={locationSearch} onChange={e => setLocationSearch(e.target.value)} placeholder="Enter address or place name..." onKeyPress={e => e.key === 'Enter' && handleLocationSearch()} className="flex-1" />
                                    <button type="button" onClick={handleLocationSearch} disabled={isSearching} className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors ${isSearching ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600'}`}>
                                        {isSearching ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Searching...</>) : (<><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Search</>)}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Search for a location to automatically fill latitude and longitude</p>
                            </InputGroup>
                            {/* Map preview */}
                            <div className="mt-4 h-64 w-full rounded-lg bg-gray-100 overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                {formData.latitude && formData.longitude ? (
                                    <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude) - 0.01},${parseFloat(formData.latitude) - 0.01},${parseFloat(formData.longitude) + 0.01},${parseFloat(formData.latitude) + 0.01}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`} title="Location Map" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400"><div className="text-center"><svg className="mx-auto h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3l10-11M8 32l12 12" /></svg><p className="mt-2 text-sm">Enter coordinates to see map preview</p></div></div>
                                )}
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">Next <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                    )}

                    {/* Rooms */}
                    {activeTab === 'rooms' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="space-y-6">
                                {formData.rooms.map((room, idx) => (
                                    <div key={idx} className="relative rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
                                        {/* Room Header */}
                                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" onClick={() => setCollapsedRooms(prev => ({ ...prev, [idx]: !prev[idx] }))}>
                                            <div className="flex flex-col gap-1 flex-1 mr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">#{idx + 1}</span>
                                                    <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Room Name</label>
                                                </div>
                                                <input type="text" value={room.name} onChange={e => updateRoom(idx, 'name', e.target.value)} onClick={e => e.stopPropagation()} placeholder="e.g. Deluxe Sea View" className={`w-full text-base font-bold text-gray-900 dark:text-white px-3 py-2 transition-all placeholder:text-gray-400 placeholder:font-normal ${collapsedRooms[idx] ? 'bg-transparent border-0 focus:outline-none' : 'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'}`} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeRoom(idx); }} className="text-gray-400 hover:text-red-500 transition-colors"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                <svg className={`h-5 w-5 text-gray-500 transition-transform ${collapsedRooms[idx] ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {/* Room Content */}
                                        {!collapsedRooms[idx] && (
                                            <div className="p-6 pt-0">
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    <InputGroup label="View Type"><Select value={room.view} onChange={e => updateRoom(idx, 'view', e.target.value)}>{ROOM_VIEWS.map(v => <option key={v}>{v}</option>)}</Select></InputGroup>
                                                    <InputGroup label="Bed Type"><Select value={room.bedType} onChange={e => updateRoom(idx, 'bedType', e.target.value)}>{BED_TYPES.map(v => <option key={v}>{v}</option>)}</Select></InputGroup>
                                                    <InputGroup label="Location"><Select value={room.location} onChange={e => updateRoom(idx, 'location', e.target.value)}>{ROOM_LOCATIONS.map(v => <option key={v}>{v}</option>)}</Select></InputGroup>
                                                    <InputGroup label="Quantity"><Input type="number" value={room.quantity} onChange={e => updateRoom(idx, 'quantity', e.target.value)} /></InputGroup>
                                                    <InputGroup label="Size (sqm)"><Input placeholder="e.g. 32-39" value={room.size} onChange={e => updateRoom(idx, 'size', e.target.value)} /></InputGroup>
                                                </div>
                                                <div className="mt-4 grid grid-cols-1 gap-6">
                                                    <InputGroup label="Description"><TextArea placeholder="Room description..." value={room.mainDescription} onChange={e => updateRoom(idx, 'mainDescription', e.target.value)} className="min-h-[80px]" /></InputGroup>
                                                    <InputGroup label="Facilities (Tags)"><Input placeholder="WiFi, AC, Kitchen..." value={room.facilities} onChange={e => updateRoom(idx, 'facilities', e.target.value)} /></InputGroup>
                                                </div>
                                                <div className="mt-4 flex items-center gap-3">
                                                    <input type="checkbox" id={`smoking-${idx}`} checked={room.smokingAllowed} onChange={e => updateRoom(idx, 'smokingAllowed', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                                                    <label htmlFor={`smoking-${idx}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">Smoking Allowed</label>
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Photos</label>
                                                    <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50">
                                                        <div className="text-center">
                                                            <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <div className="mt-2 flex text-sm text-gray-600 dark:text-gray-400">
                                                                <label htmlFor={`room-photos-${idx}`} className="relative cursor-pointer rounded-md font-medium text-brand-500 hover:text-brand-600"><span>Upload files</span><input id={`room-photos-${idx}`} type="file" className="sr-only" multiple accept="image/*" onChange={e => handleRoomPhotoUpload(idx, e)} /></label>
                                                                <p className="pl-1">or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                                            {room.media && room.media.length > 0 && (<p className="mt-2 text-xs font-medium text-green-600">{room.media.length} file(s) selected</p>)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Room Photo Previews */}
                                                {room.media && room.media.length > 0 && (
                                                    <div className="mt-4">
                                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Photos ({room.media.length})</h5>
                                                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                                                            {room.media.map((mediaItem, photoIdx) => (
                                                                <div key={photoIdx} className="relative group aspect-square rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                    <ImagePreview file={mediaItem.file} alt={`Room ${idx + 1} photo ${photoIdx + 1}`} className="h-full w-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col items-center justify-center gap-1 p-1">
                                                                        <button onClick={() => setRoomDefaultImage(idx, photoIdx)} className={`opacity-0 group-hover:opacity-100 transition-opacity rounded px-2 py-1 text-[10px] font-medium w-full ${mediaItem.isDefault ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} title="Set as default">{mediaItem.isDefault ? '✓ Default' : 'Default'}</button>
                                                                        <button onClick={() => removeRoomMedia(idx, photoIdx)} className="opacity-0 group-hover:opacity-100 transition-opacity rounded bg-red-500 text-white px-2 py-1 text-[10px] font-medium hover:bg-red-600 w-full" title="Remove image">Remove</button>
                                                                    </div>
                                                                    {mediaItem.isDefault && (<div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">DEF</div>)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {formData.rooms.length === 0 && (<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"><p>No rooms added yet. Click "+ Add Room" to start.</p></div>)}
                                <button onClick={addRoom} className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm font-medium text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-400 dark:hover:text-brand-400 transition-colors">+ Add Room</button>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">Next <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                    )}

                    {/* Contact */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <InputGroup label="Main Telephone"><Input name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+30 210..." /></InputGroup>
                                <InputGroup label="Main Email"><Input name="email" value={formData.email} onChange={handleChange} placeholder="info@hotel.com" /></InputGroup>
                            </div>
                            <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-medium text-gray-900 dark:text-white">Department Contacts</h3><button type="button" onClick={addCommunication} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add Department</button></div>
                                <div className="space-y-4">
                                    {formData.communicationDetails.map((detail, idx) => (
                                        <div key={idx} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                                            <button onClick={() => removeCommunication(idx)} className="absolute right-2 top-2 text-gray-400 hover:text-red-500"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Input placeholder="Department (e.g. Reservations)" value={detail.department} onChange={e => updateCommunication(idx, 'department', e.target.value)} />
                                                <Input placeholder="Contact Person" value={detail.contactPerson} onChange={e => updateCommunication(idx, 'contactPerson', e.target.value)} />
                                                <Input placeholder="Phone" value={detail.phone} onChange={e => updateCommunication(idx, 'phone', e.target.value)} />
                                                <Input placeholder="Email" value={detail.email} onChange={e => updateCommunication(idx, 'email', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    {formData.communicationDetails.length === 0 && (<p className="text-center text-sm text-gray-500 italic">No additional contacts added.</p>)}
                                </div>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">Next <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <InputGroup label="Main Description"><TextArea name="description" value={formData.description} onChange={handleChange} placeholder="Brief overview of the hotel..." /></InputGroup>
                            <InputGroup label="Detailed Description"><TextArea name="detailedDescription" value={formData.detailedDescription} onChange={handleChange} placeholder="Full description of amenities and experience..." className="min-h-[150px]" /></InputGroup>
                            <InputGroup label="Additional Information"><TextArea name="additionalInformation" value={formData.additionalInformation} onChange={handleChange} placeholder="Policies, important notes, etc..." /></InputGroup>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <InputGroup label="Number of Buildings"><Input name="numBuildings" type="number" value={formData.numBuildings} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Number of Rooms"><Input name="numRooms" type="number" value={formData.numRooms} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Check-In Time"><Input name="checkInTime" type="time" value={formData.checkInTime} onChange={handleChange} /></InputGroup>
                                <InputGroup label="Check-Out Time"><Input name="checkOutTime" type="time" value={formData.checkOutTime} onChange={handleChange} /></InputGroup>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-6">
                                <InputGroup label="Year Opened"><Input name="yearOpened" type="number" value={formData.yearOpened} onChange={handleChange} placeholder="YYYY" /></InputGroup>
                                <InputGroup label="Year Renovated"><Input name="yearRenovated" type="number" value={formData.yearRenovated} onChange={handleChange} placeholder="YYYY" /></InputGroup>
                                <InputGroup label="Room Renovated"><Input name="yearRoomRenovated" type="number" value={formData.yearRoomRenovated} onChange={handleChange} placeholder="YYYY" /></InputGroup>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">Next <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                    )}

                    {/* Amenities */}
                    {activeTab === 'amenities' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <InputGroup label="Facilities (Comma separated)"><TextArea name="facilities" value={formData.facilities} onChange={handleChange} placeholder="Pool, Spa, Gym, WiFi..." /></InputGroup>
                            <InputGroup label="Search Tags"><Input name="searchTags" value={formData.searchTags} onChange={handleChange} placeholder="luxury, family, beach..." /></InputGroup>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <InputGroup label="Reference Points"><TextArea name="referencePoints" value={formData.referencePoints} onChange={handleChange} placeholder="Near City Center, 500m from Beach..." /></InputGroup>
                                <InputGroup label="Nearby Points of Interest"><TextArea name="nearbyPoints" value={formData.nearbyPoints} onChange={handleChange} placeholder="Museums, Parks, Landmarks..." /></InputGroup>
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">Next <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        </div>
                    )}

                    {/* Media */}
                    {activeTab === 'media' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Upload Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Hotel Photos</label>
                                <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-10 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" /></svg>
                                        <div className="flex gap-3">
                                            <label htmlFor="hotel-media-upload" className="relative cursor-pointer rounded-md font-medium text-brand-500 hover:text-brand-600"><span>Upload files</span><input id="hotel-media-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleMediaUpload} /></label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PNG, JPG, GIF up to 10MB each</p>
                                    </div>
                                </div>
                            </div>
                            {/* Media Gallery */}
                            {formData.media.length > 0 && (
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Uploaded Images ({formData.media.length})</h3>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                        {formData.media.map((mediaItem, idx) => (
                                            <div key={idx} className="relative group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <ImagePreview file={mediaItem.file} alt={`Hotel image ${idx + 1}`} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                                                    <button onClick={() => setDefaultImage(idx)} className={`opacity-0 group-hover:opacity-100 transition-opacity rounded-lg px-3 py-1.5 text-xs font-medium ${mediaItem.isDefault ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} title="Set as default image">{mediaItem.isDefault ? '✓ Default' : 'Set Default'}</button>
                                                    <button onClick={() => removeMedia(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-red-500 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-600" title="Remove image">Remove</button>
                                                </div>
                                                {mediaItem.isDefault && (<div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">DEFAULT</div>)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {formData.media.length === 0 && (<div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"><p>No images uploaded yet. Upload images above to get started.</p></div>)}
                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8 dark:border-gray-800">
                                <button onClick={goToPreviousTab} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> Previous</button>
                                <button onClick={goToNextTab} disabled={currentTabIndex === tabOrder.length - 1} className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${currentTabIndex === tabOrder.length - 1 ? 'cursor-not-allowed text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-600' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
                                    Next
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
