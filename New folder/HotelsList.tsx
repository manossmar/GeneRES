import { useEffect, useState } from 'react';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';

export default function HotelsList() {
    const [hotels, setHotels] = useState<Hotel[]>([]);

    useEffect(() => {
        setHotels(hotelService.getHotels());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this hotel?')) {
            hotelService.deleteHotel(id);
            setHotels(hotelService.getHotels());
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Saved Hotels</h1>
                <a href="/hotels/scraper" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    + Add New Hotel
                </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Location</th>
                                <th className="py-3 px-6">Type</th>
                                <th className="py-3 px-6 text-center">Rooms</th>
                                <th className="py-3 px-6 text-center">Facilities</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                            {hotels.length > 0 ? (
                                hotels.map((hotel) => (
                                    <tr key={hotel.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="font-medium">{hotel.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <span>{hotel.location}</span>
                                        </td>
                                        <td className="py-3 px-6 text-left">
                                            <span className="bg-purple-200 text-purple-600 py-1 px-3 rounded-full text-xs">
                                                {hotel.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            {hotel.rooms.length}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            {hotel.facilities.length}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center">
                                                <button
                                                    onClick={() => handleDelete(hotel.id!)}
                                                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110 transition-transform"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-gray-500">
                                        No hotels saved yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
