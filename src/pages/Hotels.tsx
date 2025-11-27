import { useState } from "react";

import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import HotelsTable from "../components/tables/HotelsTable/HotelsTable";
import HotelForm from "../components/hotels/HotelForm";
import { HotelFormData } from "../types/hotel";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export default function Hotels() {
    const { token } = useAuth();
    const [view, setView] = useState<'table' | 'form'>('table');
    const [selectedHotel, setSelectedHotel] = useState<HotelFormData | null>(null);

    const handleAddNew = () => {
        setSelectedHotel(null);
        setView('form');
    };

    const handleEdit = async (hotel: any) => {
        try {
            // Fetch full hotel details including rooms and translations
            const response = await fetch(`http://localhost:3002/api/hotels/${hotel.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hotel details');
            }

            const fullHotel = await response.json();
            console.log('Fetched full hotel details:', fullHotel);
            console.log('Rooms from backend:', fullHotel.rooms);

            // Map DB fields to form fields
            const formData: HotelFormData = {
                id: fullHotel.id, // Preserve ID for updates
                // Direct DB mappings
                name: fullHotel.name || '',
                code: fullHotel.code || '',
                typeDescription: fullHotel.typeDescription || '',
                locationDescription: fullHotel.locationDescription || '',
                officialRating: fullHotel.officialRating || '',
                ratingCommercial: fullHotel.ratingCommercial || '',
                googleRating: fullHotel.googleRating || '',
                architectureStyle: fullHotel.architectureStyle || '',
                yearOpened: fullHotel.yearOpened || '',
                yearRenovated: fullHotel.yearRenovated || '',
                yearRoomRenovated: fullHotel.yearRoomRenovated || '',
                airportCode: fullHotel.airportCode || '',
                url: fullHotel.url || '',
                address1: fullHotel.address1 || '',
                cityName: fullHotel.cityName || '',
                prefectureName: fullHotel.prefectureName || '',
                country: fullHotel.country || '',
                zip: fullHotel.zip || '',
                latitude: fullHotel.latitude ? String(fullHotel.latitude) : '',
                longitude: fullHotel.longitude ? String(fullHotel.longitude) : '',
                telephone: fullHotel.telephone || '',
                email: fullHotel.email || '',
                numBuildings: fullHotel.numBuildings || '',
                numRooms: fullHotel.numRooms || '',
                checkInTime: fullHotel.checkInTime || '',
                checkOutTime: fullHotel.checkOutTime || '',
                searchTags: fullHotel.searchTags || '',
                facilities: fullHotel.facilities || '',
                referencePoints: fullHotel.referencePoints || '',
                nearbyPoints: fullHotel.nearbyPoints || '',

                // Translations
                translations: {
                    en: { description: '', detailedDescription: '', additionalInformation: '', ...(fullHotel.translations?.en || {}) },
                    fr: { description: '', detailedDescription: '', additionalInformation: '', ...(fullHotel.translations?.fr || {}) },
                    de: { description: '', detailedDescription: '', additionalInformation: '', ...(fullHotel.translations?.de || {}) },
                    ru: { description: '', detailedDescription: '', additionalInformation: '', ...(fullHotel.translations?.ru || {}) },
                    it: { description: '', detailedDescription: '', additionalInformation: '', ...(fullHotel.translations?.it || {}) },
                },

                // Rooms with translations
                rooms: fullHotel.rooms || [],

                // Communication details and media
                communicationDetails: fullHotel.communicationDetails || [],
                media: fullHotel.media || [],
            };

            setSelectedHotel(formData);
            setView('form');
        } catch (error) {
            console.error('Error fetching hotel details:', error);
            showNotification('error', 'Error', 'Failed to load hotel details');
        }
    };

    const handleCloseForm = () => {
        setView('table');
        setSelectedHotel(null);
    };

    const { showNotification } = useNotification();

    const handleSubmit = async (data: HotelFormData) => {
        try {
            // Prepare payload with all fields and translations
            const payload = {
                name: data.name,
                code: data.code,
                typeDescription: data.typeDescription,
                locationDescription: data.locationDescription,
                officialRating: data.officialRating,
                ratingCommercial: data.ratingCommercial,
                googleRating: data.googleRating,
                architectureStyle: data.architectureStyle,
                yearOpened: data.yearOpened,
                yearRenovated: data.yearRenovated,
                yearRoomRenovated: data.yearRoomRenovated,
                airportCode: data.airportCode,
                url: data.url,
                address1: data.address1,
                cityName: data.cityName,
                prefectureName: data.prefectureName,
                country: data.country,
                zip: data.zip,
                latitude: data.latitude,
                longitude: data.longitude,
                telephone: data.telephone,
                email: data.email,
                numBuildings: data.numBuildings,
                numRooms: data.numRooms,
                checkInTime: data.checkInTime,
                checkOutTime: data.checkOutTime,
                searchTags: data.searchTags,
                facilities: data.facilities,
                referencePoints: data.referencePoints,
                nearbyPoints: data.nearbyPoints,
                translations: data.translations,
                rooms: data.rooms,
                communicationDetails: data.communicationDetails,
                media: data.media,
            };

            // Determine if this is a create or update operation
            const isUpdate = selectedHotel !== null && (selectedHotel as any).id;
            const url = isUpdate
                ? `http://localhost:3002/api/hotels/${(selectedHotel as any).id}`
                : 'http://localhost:3002/api/hotels';
            const method = isUpdate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} hotel`);
            }

            const result = await response.json();
            console.log('Hotel saved successfully:', result);

            showNotification(
                'success',
                'Success',
                `Hotel ${isUpdate ? 'updated' : 'created'} successfully`
            );

            // Only update form state if it was a create operation (to bind the new ID)
            // For updates, we leave the form as is to prevent flashing/resetting
            if (!isUpdate) {
                handleEdit(result);
            }

        } catch (error) {
            console.error('Error saving hotel:', error);
            showNotification(
                'error',
                'Error',
                `Failed to save hotel: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    };

    return (
        <>
            <PageMeta
                title="Hotels | TailAdmin - React.js Admin Dashboard Template"
                description="This is Hotels page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />

            <div className="space-y-6">
                {view === 'table' ? (
                    <ComponentCard title="Hotel Data">
                        <HotelsTable
                            onAddNew={handleAddNew}
                            onEdit={handleEdit}
                        />
                    </ComponentCard>
                ) : (
                    <HotelForm
                        initialData={selectedHotel}
                        onClose={handleCloseForm}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </>
    );
}
