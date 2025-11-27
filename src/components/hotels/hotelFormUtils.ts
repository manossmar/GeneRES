import { HotelFormData } from "../../types/hotel";

export const initialData: HotelFormData = {
    name: '',
    code: '',
    typeDescription: 'Hotel',
    locationDescription: 'City',
    officialRating: '',
    ratingCommercial: '',
    googleRating: '',
    architectureStyle: '',
    yearOpened: '',
    yearRenovated: '',
    yearRoomRenovated: '',
    airportCode: '',
    url: '',
    address1: '',
    cityName: '',
    prefectureName: '',
    country: '',
    zip: '',
    latitude: '',
    longitude: '',
    telephone: '',
    email: '',
    communicationDetails: [],
    description: '',
    detailedDescription: '',
    additionalInformation: '',
    numBuildings: '',
    numRooms: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    searchTags: '',
    facilities: '',
    referencePoints: '',
    nearbyPoints: '',
    rooms: [],
    media: [],
};

export const ROOM_VIEWS = [
    'Lagoon View', 'Creek View', 'Desert View', 'Palm Sea View', 'Palace View',
    'Partial Sea or Lagoon View', 'Partial Lagoon View', 'Partial Sea View',
    'City view or Garden view', 'City view', 'Golf view', 'Mountain view',
    'Pool view', 'Beach view', 'Garden view', 'Various views', 'Sea view',
    'Lake View', 'Sea or Pool view', 'Countryside view', 'Bay view', 'Side Sea view',
];

export const BED_TYPES = [
    '1 King or 1 King & 1 Single Bed', '1 King & 1 Qeen', '1 Queen & 2 Sofa Beds',
    '1 Queen or 2 Twin Beds', '1 Queen or 1 Twin Beds', '2 King & 1 Twin Beds',
    '2 King & 4 Double Beds', '1 King & 4 Double Beds', '1 King & 2 Twin Beds',
    '1 King or 2 Twin Beds', '1 King & 2 Double Beds', '1 King or 2 Queen',
    '2 x Queen', 'King', 'Queen', 'Sofa bed', 'Twin', 'Single', 'Double/ Twin', 'Double',
];

export const ROOM_LOCATIONS = [
    'Annexe', 'Villas', 'Bungalows', 'North', 'South', 'Top floor', 'West',
    'First floor', 'Ground floor', 'Lobby level', 'Poolside', 'Main building',
    'Near stairs', 'Executive floor', 'Sea front', 'Second floor',
];
