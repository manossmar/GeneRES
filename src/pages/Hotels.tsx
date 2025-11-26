import { useState } from "react";

import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import HotelsTable from "../components/tables/HotelsTable/HotelsTable";
import HotelForm from "../components/hotels/HotelForm";


export default function Hotels() {
    const [view, setView] = useState<'table' | 'form'>('table');
    const [selectedHotel, setSelectedHotel] = useState<any | null>(null); // Replace 'any' with proper Hotel type if available

    const handleAddNew = () => {
        setSelectedHotel(null);
        setView('form');
    };

    const handleEdit = (hotel: any) => {
        setSelectedHotel(hotel);
        setView('form');
    };

    const handleCloseForm = () => {
        setView('table');
        setSelectedHotel(null);
    };

    const handleSubmit = (data: any) => {
        console.log('Hotel form data:', data);
        // TODO: Send data to backend API
        handleCloseForm();
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
