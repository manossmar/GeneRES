import { useState, useEffect } from "react";
import DataTable from "../../common/DataTable";
import { useNotification } from "../../../context/NotificationContext";
import { useFetchWithAuth } from "../../../hooks/useFetchWithAuth";

interface Hotel {
    id: number;
    integrationProviderId?: number;
    clid: number;
    integrationHotelName?: string;
    code?: string;
    giata_id?: number;
    currency?: string;
    name: string;
    imageThumbURL?: string;
    country?: string;
    state?: number;
    stateProvinceName?: string;
    prefecture?: number;
    prefectureName?: string;
    city?: number;
    cityName?: string;
    address1?: string;
    address2?: string;
    address3?: string;
    addressNotes?: string;
    rating?: string;
    longitude?: number;
    latitude?: number;
    type?: number;
    typeDescription?: string;
    location?: number;
    locationDescription?: string;
    officialRating?: string;
    description?: string;
    lowRate?: number;
    specialOffer?: number;
    travelAdvisor?: number;
    availability?: number;
    lowestPrice?: number;
    officialRating_ID?: number;
    property_Class_ID?: number;
    hotelinfo?: any;
    places_api?: any;
    dateCreated?: string;
    dateLastUpdated?: string;
    googleRating?: string;
}

export default function HotelsTable() {
    const [tableData, setTableData] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();
    const fetchWithAuth = useFetchWithAuth();

    // Load hotels from API
    const loadHotels = async () => {
        try {
            setIsLoading(true);
            const response = await fetchWithAuth('/api/hotels');

            if (!response) {
                throw new Error('No response from server');
            }

            // Log response details for debugging
            console.log('Hotels API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Hotels API error:', errorText);
                throw new Error(`Failed to fetch hotels: ${response.status}`);
            }

            const text = await response.text();
            console.log('Hotels API response text:', text.substring(0, 200));

            const data = JSON.parse(text);
            setTableData(data);
        } catch (error) {
            console.error('Error loading hotels:', error);
            showNotification('error', 'Error', 'Failed to load hotels');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    const handleEdit = (item: Hotel) => {
        console.log("Edit item:", item);
        alert(`Edit ${item.name}`);
    };

    const handleDelete = async (item: Hotel) => {
        try {
            const response = await fetchWithAuth(`/api/hotels/${item.id}`, {
                method: 'DELETE',
            });

            if (!response || !response.ok) throw new Error('Failed to delete hotel');

            setTableData((prev) => prev.filter((h) => h.id !== item.id));
            showNotification('success', 'Deleted', `${item.name} has been deleted successfully.`);
        } catch (error) {
            console.error('Error deleting hotel:', error);
            showNotification('error', 'Error', 'Failed to delete hotel');
        }
    };

    const handleSelectionChange = (selectedItems: Hotel[]) => {
        console.log("Selected items:", selectedItems);
    };

    const handleAddNew = () => {
        alert('Add new hotel functionality coming soon');
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading hotels...</div>;
    }

    return (
        <DataTable
            columns={[
                // Visible columns
                { key: "id", label: "ID", sortable: true, resizable: true, numeric: true },
                { key: "clid", label: "CLID", sortable: true, resizable: true, numeric: true },
                { key: "name", label: "Name", sortable: true, resizable: true },
                { key: "officialRating", label: "Official Rating", sortable: true, resizable: true },
                { key: "typeDescription", label: "Type", sortable: true, resizable: true },
                { key: "cityName", label: "City", sortable: true, resizable: true },
                { key: "stateProvinceName", label: "State/Province", sortable: true, resizable: true },
                { key: "prefectureName", label: "Prefecture", sortable: true, resizable: true },
                { key: "country", label: "Country", sortable: true, resizable: true },

                // Additional columns (user can show/hide via column chooser)
                { key: "integrationProviderId", label: "Integration Provider ID", sortable: true, resizable: true, numeric: true },
                { key: "integrationHotelName", label: "Integration Hotel Name", sortable: true, resizable: true },
                { key: "code", label: "Code", sortable: true, resizable: true },
                { key: "giata_id", label: "GIATA ID", sortable: true, resizable: true, numeric: true },
                { key: "currency", label: "Currency", sortable: true, resizable: true },
                { key: "imageThumbURL", label: "Image Thumbnail URL", sortable: true, resizable: true },
                { key: "state", label: "State ID", sortable: true, resizable: true, numeric: true },
                { key: "prefecture", label: "Prefecture ID", sortable: true, resizable: true, numeric: true },
                { key: "city", label: "City ID", sortable: true, resizable: true, numeric: true },
                { key: "address1", label: "Address 1", sortable: true, resizable: true },
                { key: "address2", label: "Address 2", sortable: true, resizable: true },
                { key: "address3", label: "Address 3", sortable: true, resizable: true },
                { key: "addressNotes", label: "Address Notes", sortable: true, resizable: true },
                { key: "rating", label: "Rating", sortable: true, resizable: true },
                { key: "longitude", label: "Longitude", sortable: true, resizable: true, numeric: true },
                { key: "latitude", label: "Latitude", sortable: true, resizable: true, numeric: true },
                { key: "type", label: "Type ID", sortable: true, resizable: true, numeric: true },
                { key: "location", label: "Location ID", sortable: true, resizable: true, numeric: true },
                { key: "locationDescription", label: "Location Description", sortable: true, resizable: true },
                { key: "description", label: "Description", sortable: true, resizable: true },
                { key: "lowRate", label: "Low Rate", sortable: true, resizable: true, numeric: true },
                { key: "specialOffer", label: "Special Offer", sortable: true, resizable: true, numeric: true },
                { key: "travelAdvisor", label: "Travel Advisor", sortable: true, resizable: true, numeric: true },
                { key: "availability", label: "Availability", sortable: true, resizable: true, numeric: true },
                { key: "lowestPrice", label: "Lowest Price", sortable: true, resizable: true, numeric: true },
                { key: "officialRating_ID", label: "Official Rating ID", sortable: true, resizable: true, numeric: true },
                { key: "property_Class_ID", label: "Property Class ID", sortable: true, resizable: true, numeric: true },
                { key: "googleRating", label: "Google Rating", sortable: true, resizable: true },
                { key: "dateCreated", label: "Date Created", sortable: true, resizable: true },
                { key: "dateLastUpdated", label: "Date Last Updated", sortable: true, resizable: true },
            ]}
            data={tableData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={handleAddNew}
            onSelectionChange={handleSelectionChange}
            enableSearch={true}
            enablePagination={true}
            enableShowEntries={true}
            enableFilter={true}
            enableAutoFilter={true}
            enableDownload={true}
            initialVisibleColumns={['id', 'clid', 'name', 'officialRating', 'typeDescription', 'cityName', 'stateProvinceName', 'prefectureName', 'country']}
        />
    );
}
