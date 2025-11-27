export interface CommunicationDetail {
    department: string;
    contactPerson: string;
    phone: string;
    email: string;
}

export interface MediaFile {
    file: File;
    isDefault: boolean;
}

export interface RoomTranslation {
    name: string;
    mainDescription: string;
}

export interface RoomDetail {
    view: string;
    bedType: string;
    quantity: string;
    location: string;
    size: string;
    smokingAllowed: boolean;
    facilities: string;
    media: MediaFile[];
    translations: {
        [languageCode: string]: RoomTranslation;
    };
}

export interface HotelTranslation {
    description: string;
    detailedDescription: string;
    additionalInformation: string;
}

export interface HotelFormData {
    id?: number; // Optional ID for updates

    // Basic Info (Direct DB columns)
    name: string;
    code: string;
    typeDescription: string;
    locationDescription: string;
    officialRating: string;
    ratingCommercial: string;
    googleRating: string;
    architectureStyle: string;
    yearOpened: string;
    yearRenovated: string;
    yearRoomRenovated: string;
    airportCode: string;
    url: string;

    // Location & Contact (Direct DB columns)
    address1: string;
    cityName: string;
    prefectureName: string;
    country: string;
    zip: string;
    latitude: string;
    longitude: string;
    telephone: string;
    email: string;
    communicationDetails: CommunicationDetail[];

    // Details (Direct DB columns)
    numBuildings: string;
    numRooms: string;
    checkInTime: string;
    checkOutTime: string;

    // Lists & Tags (Direct DB columns)
    searchTags: string;
    facilities: string;
    referencePoints: string;
    nearbyPoints: string;

    // Translatable fields
    translations: {
        [languageCode: string]: HotelTranslation;
    };

    // Rooms
    rooms: RoomDetail[];

    // Media
    media: MediaFile[];
}

// DB Structure for reference
export interface HotelDB {
    id?: number;
    name: string;
    code: string;
    typeDescription?: string;
    locationDescription?: string;
    officialRating?: string;
    googleRating?: string;
    address1?: string;
    cityName?: string;
    prefectureName?: string;
    country?: string;
    zip?: string;
    latitude?: string | number;
    longitude?: string | number;
    telephone?: string;
    email?: string;
    hotelinfo?: string; // JSON string (deprecated)
    imageThumbURL?: string;
    translations?: {
        [languageCode: string]: HotelTranslation;
    };
    rooms?: RoomDetail[];
}

// Supported languages
export interface Language {
    code: string;
    name: string;
    nativeName: string;
    isDefault: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', isDefault: true },
    { code: 'fr', name: 'French', nativeName: 'Français', isDefault: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', isDefault: false },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', isDefault: false },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', isDefault: false },
];
