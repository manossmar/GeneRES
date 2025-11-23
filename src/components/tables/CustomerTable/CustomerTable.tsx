import { useState, useEffect } from "react";
import DataTable from "../../common/DataTable";
import { useNotification } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";

interface Customer {
    id: number;
    name: string;
    position: string;
    office: string;
    age: number;
    startDate: string;
    salary: string;
}

export default function CustomerTable() {
    const [tableData, setTableData] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
        name: "",
        position: "",
        office: "",
        age: 0,
        startDate: "",
        salary: "",
    });
    const { showConfirmation, showNotification } = useNotification();
    const { token } = useAuth();

    // Load customers from database
    useEffect(() => {
        if (token) {
            loadCustomers();
        }
    }, [token]);

    const loadCustomers = async () => {
        try {
            const response = await fetch('http://localhost:3002/api/customers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Map database fields to component fields
                const formattedData = data.map((customer: any) => ({
                    id: customer.id,
                    name: customer.name,
                    position: customer.position || "",
                    office: customer.office || "",
                    age: customer.age || 0,
                    startDate: customer.start_date || "",
                    salary: customer.salary || "",
                }));
                setTableData(formattedData);
            } else {
                showNotification('error', 'Error', 'Failed to load customers');
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            showNotification('error', 'Error', 'Failed to load customers');
        }
    };

    const handleEdit = (item: Customer) => {
        setEditingCustomer(item);
        setFormData({
            name: item.name,
            position: item.position,
            office: item.office,
            age: item.age,
            startDate: item.startDate,
            salary: item.salary,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (item: Customer) => {
        showConfirmation(
            "Delete Customer",
            `Are you sure you want to delete ${item.name}?`,
            async () => {
                try {
                    const response = await fetch(`http://localhost:3002/api/customers/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        showNotification('success', 'Deleted', `${item.name} has been deleted successfully.`);
                        await loadCustomers();
                    } else {
                        showNotification('error', 'Error', 'Failed to delete customer');
                    }
                } catch (error) {
                    console.error('Error deleting customer:', error);
                    showNotification('error', 'Error', 'Failed to delete customer');
                }
            },
            () => {
                console.log("Delete cancelled");
            }
        );
    };

    const handleSelectionChange = (selectedItems: Customer[]) => {
        console.log("Selected customers:", selectedItems);
    };

    const handleAddNew = () => {
        setEditingCustomer(null);
        setFormData({
            name: "",
            position: "",
            office: "",
            age: 0,
            startDate: "",
            salary: "",
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({
            name: "",
            position: "",
            office: "",
            age: 0,
            startDate: "",
            salary: "",
        });
    };

    const handleSave = async () => {
        if (!formData.name) {
            showNotification('warning', 'Validation Error', 'Name is required');
            return;
        }

        try {
            if (editingCustomer) {
                // Update existing customer
                const response = await fetch(`http://localhost:3002/api/customers/${editingCustomer.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        position: formData.position,
                        office: formData.office,
                        age: formData.age,
                        start_date: formData.startDate,
                        salary: formData.salary,
                    }),
                });

                if (response.ok) {
                    showNotification('success', 'Updated', `${formData.name} has been updated successfully.`);
                    await loadCustomers();
                } else {
                    showNotification('error', 'Error', 'Failed to update customer');
                }
            } else {
                // Create new customer
                const response = await fetch('http://localhost:3002/api/customers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        position: formData.position,
                        office: formData.office,
                        age: formData.age,
                        start_date: formData.startDate,
                        salary: formData.salary,
                    }),
                });

                if (response.ok) {
                    showNotification('success', 'Customer Added', `${formData.name} has been added successfully.`);
                    await loadCustomers();
                } else {
                    showNotification('error', 'Error', 'Failed to create customer');
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving customer:', error);
            showNotification('error', 'Error', 'Failed to save customer');
        }
    };

    return (
        <>
            <DataTable
                columns={[
                    { key: "name", label: "Name", sortable: true, resizable: true },
                    { key: "position", label: "Position", sortable: true, resizable: true },
                    { key: "office", label: "Office", sortable: true, resizable: true },
                    { key: "age", label: "Age", sortable: true, resizable: true, numeric: true },
                    { key: "startDate", label: "Start Date", sortable: true, resizable: true },
                    { key: "salary", label: "Salary", sortable: true, resizable: true, numeric: true },
                ]}
                data={tableData}
                actionButtons={[
                    {
                        label: "Edit",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        ),
                        onClick: handleEdit,
                        variant: "default",
                    },
                    {
                        label: "Delete",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        ),
                        onClick: handleDelete,
                        variant: "danger",
                    },
                ]}
                onSelectionChange={handleSelectionChange}
                enableSearch={true}
                enablePagination={true}
                enableShowEntries={true}
                enableFilter={true}
                enableAutoFilter={true}
                enableDownload={true}
                onAddNew={handleAddNew}
            />

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={handleCloseModal}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Position
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Office
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.office}
                                        onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.age || ""}
                                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="YYYY/MM/DD"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Salary
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="$0"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                                >
                                    {editingCustomer ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
