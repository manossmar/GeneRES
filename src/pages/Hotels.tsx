import { useState } from "react";

import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import HotelsTable from "../components/tables/HotelsTable/HotelsTable";
import HotelForm from "../components/hotels/HotelForm";
import { HotelFormData } from "../types/hotel";

export default function Hotels() {
    const [view, setView] = useState<'table' | 'form'>('table');
    const [selectedHotel, setSelectedHotel] = useState<HotelFormData | null>(null);

    const handleAddNew = () => {
        setSelectedHotel(null);
        setView('form');
    };

    const handleEdit = (hotel: any) => {
        // Unpack hotelinfo JSON and map DB fields to form fields
        let hotelInfo: any = {};
        try {
            hotelInfo = hotel.hotelinfo ? JSON.parse(hotel.hotelinfo) : {};
        } catch (error) {
            console.error('Error parsing hotelinfo:', error);
        }

        const formData: HotelFormData = {
            // Direct DB mappings
            name: hotel.name || '',
            code: hotel.code || '',
            address1: hotel.address1 || '',
            cityName: hotel.cityName || '',
            prefectureName: hotel.prefectureName || '',
            country: hotel.country || '',
            zip: hotel.zip || '',
            latitude: hotel.latitude ? String(hotel.latitude) : '',
            longitude: hotel.longitude ? String(hotel.longitude) : '',
            telephone: hotel.telephone || '',
            email: hotel.email || '',

            // Fields from hotelinfo JSON
            typeDescription: hotelInfo.typeDescription || '',
            locationDescription: hotelInfo.locationDescription || '',
            officialRating: hotelInfo.officialRating || '',
            ratingCommercial: hotelInfo.ratingCommercial || '',
            googleRating: hotelInfo.googleRating || '',
            architectureStyle: hotelInfo.architectureStyle || '',
            yearOpened: hotelInfo.yearOpened || '',
            yearRenovated: hotelInfo.yearRenovated || '',
            yearRoomRenovated: hotelInfo.yearRoomRenovated || '',
            airportCode: hotelInfo.airportCode || '',
            url: hotelInfo.url || '',
            description: hotelInfo.description || '',
            detailedDescription: hotelInfo.detailedDescription || '',
            additionalInformation: hotelInfo.additionalInformation || '',
            numBuildings: hotelInfo.numBuildings || '',
            numRooms: hotelInfo.numRooms || '',
            checkInTime: hotelInfo.checkInTime || '',
            checkOutTime: hotelInfo.checkOutTime || '',
            searchTags: hotelInfo.searchTags || '',
            facilities: hotelInfo.facilities || '',
            referencePoints: hotelInfo.referencePoints || '',
            nearbyPoints: hotelInfo.nearbyPoints || '',
            communicationDetails: hotelInfo.communicationDetails || [],
            rooms: hotelInfo.rooms || [],
            media: hotelInfo.media || [],
        };

        setSelectedHotel(formData);
        setView('form');
    };

    const handleCloseForm = () => {
        setView('table');
        setSelectedHotel(null);
    };

    const handleSubmit = async (data: HotelFormData) => {
        try {
            // Separate fields that go directly to DB columns vs hotelinfo JSON
            const directFields = {
                name: data.name,
                code: data.code,
                address1: data.address1,
                cityName: data.cityName,
                prefectureName: data.prefectureName,
                country: data.country,
                zip: data.zip,
                latitude: data.latitude,
                longitude: data.longitude,
                telephone: data.telephone,
                email: data.email,
            };

            // Pack remaining fields into hotelinfo JSON
            const hotelInfo = {
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
                description: data.description,
                detailedDescription: data.detailedDescription,
                additionalInformation: data.additionalInformation,
                numBuildings: data.numBuildings,
                numRooms: data.numRooms,
                checkInTime: data.checkInTime,
                checkOutTime: data.checkOutTime,
                searchTags: data.searchTags,
                facilities: data.facilities,
                referencePoints: data.referencePoints,
                nearbyPoints: data.nearbyPoints,
                communicationDetails: data.communicationDetails,
                rooms: data.rooms,
                media: data.media,
            };

            const payload = {
                ...directFields,
                hotelinfo: JSON.stringify(hotelInfo),
            };

            // Determine if this is a create or update operation
            const isUpdate = selectedHotel !== null;
            const url = isUpdate
                ? `http://localhost:5000/api/hotels/${(selectedHotel as any).id}`
                : 'http://localhost:5000/api/hotels';
            const method = isUpdate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} hotel`);
            }

            const result = await response.json();
            console.log('Hotel saved successfully:', result);

            // Close form and refresh table
            handleCloseForm();
            // TODO: Trigger table refresh
        } catch (error) {
            console.error('Error saving hotel:', error);
            alert(`Error saving hotel: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
