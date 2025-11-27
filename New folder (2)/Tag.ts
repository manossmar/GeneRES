export interface Tag {
    id: string;              // Unique identifier
    name: string;            // Display name
    category: string;        // Tag category (e.g., "amenity", "location", "service")
    typename: string;        // Type classification
    description: string;     // Detailed description
    charge: boolean;         // Whether this tag implies additional charges
    distance?: string;       // Optional distance info (e.g., "500m", "2km")
    createdAt: number;       // Timestamp
}

export interface CreateTagInput {
    name: string;
    category: string;
    typename: string;
    description: string;
    charge: boolean;
    distance?: string;
}
