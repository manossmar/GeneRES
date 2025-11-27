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

export interface RoomDetail {
    name: string;
    type: string;
    view: string;
    bedType: string;
    quantity: string;
    location: string;
    size: string;
    smokingAllowed: boolean;
    mainDescription: string;
    facilities: string;
    media: MediaFile[];
}

export interface HotelFormData {
    // Basic Info (Matched to DB)
    name: string;
    code: string;
    typeDescription: string; // Was type
    locationDescription: string; // Was locationCategory
    officialRating: string; // Was ratingOfficial
    ratingCommercial: string; // Unmatched -> hotelinfo
    googleRating: string; // Was ratingGoogle
    architectureStyle: string; // Unmatched -> hotelinfo
    yearOpened: string; // Unmatched -> hotelinfo
    yearRenovated: string; // Unmatched -> hotelinfo
    yearRoomRenovated: string; // Unmatched -> hotelinfo
    airportCode: string; // Unmatched -> hotelinfo
    url: string; // Unmatched -> hotelinfo

    // Location & Contact
    address1: string; // Was address
    cityName: string; // Was city
    prefectureName: string; // Was prefecture
    country: string;
    zip: string; // Unmatched -> hotelinfo
    latitude: string;
    longitude: string;
    telephone: string; // Unmatched -> hotelinfo
    email: string; // Unmatched -> hotelinfo
    communicationDetails: CommunicationDetail[]; // Unmatched -> hotelinfo

    // Details
    description: string; // Was mainDescription
    detailedDescription: string; // Unmatched -> hotelinfo
    additionalInformation: string; // Unmatched -> hotelinfo
    numBuildings: string; // Unmatched -> hotelinfo
    numRooms: string; // Unmatched -> hotelinfo
    checkInTime: string; // Unmatched -> hotelinfo
    checkOutTime: string; // Unmatched -> hotelinfo

    // Lists & Tags
    searchTags: string; // Unmatched -> hotelinfo
    facilities: string; // Unmatched -> hotelinfo
    referencePoints: string; // Unmatched -> hotelinfo
    nearbyPoints: string; // Unmatched -> hotelinfo

    // Rooms
    rooms: RoomDetail[]; // Unmatched -> hotelinfo

    // Media
    media: MediaFile[]; // Unmatched -> hotelinfo (DB has imageThumbURL)
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
    description?: string;
    hotelinfo?: string; // JSON string
    imageThumbURL?: string;
}
