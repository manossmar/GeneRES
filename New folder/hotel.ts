export interface Room {
    name: string;
    description?: string;
    amenities: string[];
    view: string;
    size: string;
    images?: string[]; // Room-specific images
}

export interface Hotel {
    id?: string;
    name: string;
    description: string;
    longDescription?: string;
    location: string;
    type: string;
    facilities: string[];
    rooms: Room[];
    images: string[];
    mainImage?: string;
    url?: string;
}
