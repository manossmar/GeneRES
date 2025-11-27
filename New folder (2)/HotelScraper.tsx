import React, { useState } from 'react';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';

export default function HotelScraper() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [scrapedData, setScrapedData] = useState<Hotel | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleScrape = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setScrapedData(null);
        setSuccess('');

        try {
            const data = await hotelService.scrapeHotel(url);
            setScrapedData(data);
        } catch (err) {
            setError('Failed to scrape hotel. Please check the URL and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (scrapedData) {
            hotelService.saveHotel(scrapedData);
            setSuccess('Hotel saved successfully!');
            setScrapedData(null);
            setUrl('');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Hotel Scraper</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <form onSubmit={handleScrape} className="flex gap-4">
                    <input
                        type="url"
                        placeholder="Enter Hotel URL (e.g., https://www.booking.com/...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Hotel'}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {success && <p className="text-green-500 mt-4">{success}</p>}
            </div>

            {scrapedData && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in">
                    {/* Header Section with Main Image */}
                    <div className="relative h-64 md:h-80 mb-6 rounded-xl overflow-hidden">
                        {scrapedData.mainImage ? (
                            <img src={scrapedData.mainImage} alt={scrapedData.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                No Main Image Found
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                            <h2 className="text-3xl font-bold text-white mb-2">{scrapedData.name}</h2>
                            <p className="text-gray-200 flex items-center gap-2">
                                <span className="text-blue-400">📍</span> {scrapedData.location}
                            </p>
                        </div>
                        <span className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg">
                            {scrapedData.type}
                        </span>
                    </div>

                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleSave}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                            Save to Database
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Description & Facilities */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">About the Hotel</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed italic">
                                    {scrapedData.description}
                                </p>
                                {scrapedData.longDescription && (
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {scrapedData.longDescription}
                                    </p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">Facilities</h3>
                                <div className="flex flex-wrap gap-3">
                                    {scrapedData.facilities.length > 0 ? (
                                        scrapedData.facilities.map((facility, index) => (
                                            <span key={index} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                                                {facility}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No facilities detected.</p>
                                    )}
                                </div>
                            </div>

                            {scrapedData.images.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">Gallery</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {scrapedData.images.slice(0, 8).map((img, idx) => (
                                            <img key={idx} src={img} alt={`Hotel ${idx}`} className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Rooms */}
                        <div className="lg:col-span-1">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">Rooms Available</h3>
                            <div className="space-y-4">
                                {scrapedData.rooms.length > 0 ? (
                                    scrapedData.rooms.map((room, index) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow">
                                            <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{room.name}</h4>
                                            {room.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-3">{room.description}</p>
                                            )}
                                            {room.images && room.images.length > 0 && (
                                                <div className="mb-3 grid grid-cols-2 gap-2">
                                                    {room.images.slice(0, 2).map((img, imgIdx) => (
                                                        <img key={imgIdx} src={img} alt={`${room.name} ${imgIdx}`} className="w-full h-24 object-cover rounded-lg" />
                                                    ))}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2 mb-3">
                                                <p className="flex items-center gap-1">📏 {room.size}</p>
                                                <p className="flex items-center gap-1">👁️ {room.view}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {room.amenities.map((amenity, i) => (
                                                    <span key={i} className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No rooms detected.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
