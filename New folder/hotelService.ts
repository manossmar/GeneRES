import { Hotel } from '../types/hotel';

const API_URL = 'http://localhost:5000';
const STORAGE_KEY = 'hotels_db';

export const hotelService = {
    // Scrape hotel data from the Node.js server
    scrapeHotel: async (url: string): Promise<Hotel> => {
        try {
            const response = await fetch(`${API_URL}/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to scrape hotel');
            }

            const data = await response.json();
            return { ...data, url };
        } catch (error) {
            console.error('Error scraping hotel:', error);
            throw error;
        }
    },

    // Save hotel to LocalStorage
    saveHotel: (hotel: Hotel): void => {
        const hotels = hotelService.getHotels();
        const newHotel = { ...hotel, id: crypto.randomUUID() };
        hotels.push(newHotel);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    },

    // Get all saved hotels
    getHotels: (): Hotel[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Delete a hotel
    deleteHotel: (id: string): void => {
        const hotels = hotelService.getHotels();
        const filtered = hotels.filter(h => h.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};
