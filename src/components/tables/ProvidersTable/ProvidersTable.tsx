import { useState, useEffect } from "react";
import DataTable from "../../common/DataTable";
import Badge from "../../ui/badge/Badge";
import { useNotification } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import { useFetchWithAuth } from "../../../hooks/useFetchWithAuth";

interface Provider {
    id: number;
    name: string;
    category: string;
    status: string;
    description: string;
    notes: string;
    creation_date: string;
}

export default function ProvidersTable() {
    const [tableData, setTableData] = useState<Provider[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [formData, setFormData] = useState<Omit<Provider, 'id'>>({
        name: "",
        category: "",
        status: "",
        description: "",
        notes: "",
        creation_date: "",
    });
    const { showConfirmation, showNotification } = useNotification();

    const { token } = useAuth();
    const fetchWithAuth = useFetchWithAuth();

    // Load providers from database
    useEffect(() => {
        if (token) {
            loadProviders();
        }
    }, [token]);

    const loadProviders = async () => {
        try {
            const response = await fetchWithAuth('http://localhost:3002/api/providers');

            if (response && response.ok) {
                const data = await response.json();
                setTableData(data);
            } else {
                showNotification('error', 'Error', 'Failed to load providers');
            }
        } catch (error) {
            console.error('Error loading providers:', error);
            showNotification('error', 'Error', 'Failed to load providers');
        }
    };

    const handleEdit = (item: Provider) => {
        setEditingProvider(item);
        setFormData({
            name: item.name,
            category: item.category || "",
            status: item.status || "",
            description: item.description || "",
            notes: item.notes || "",
            creation_date: item.creation_date ? item.creation_date.split('T')[0] : "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (item: Provider) => {
        showConfirmation(
            "Delete Provider",
            `Are you sure you want to delete ${item.name}?`,
            async () => {
                try {
                    const response = await fetchWithAuth(`http://localhost:3002/api/providers/${item.id}`, {
                        method: 'DELETE',
                    });

                    if (response && response.ok) {
                        showNotification('success', 'Deleted', `${item.name} has been deleted successfully.`);
                        await loadProviders();
                    } else {
                        showNotification('error', 'Error', 'Failed to delete provider');
                    }
                } catch (error) {
                    console.error('Error deleting provider:', error);
                    showNotification('error', 'Error', 'Failed to delete provider');
                }
            },
            () => {
                console.log("Delete cancelled");
            }
        );
    };

    const handleSelectionChange = (selectedItems: Provider[]) => {
        console.log("Selected providers:", selectedItems);
    };

    const handleAddNew = () => {
        setEditingProvider(null);
        setFormData({
            name: "",
            category: "",
            status: "",
            description: "",
            notes: "",
            creation_date: new Date().toISOString().split('T')[0],
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProvider(null);
        setFormData({
            name: "",
            category: "",
            status: "",
            description: "",
            notes: "",
            creation_date: "",
        });
    };

    const handleSave = async () => {
        if (!formData.name) {
            showNotification('warning', 'Validation Error', 'Name is required');
            return;
        }

        try {
            if (editingProvider) {
                // Update existing provider
                const response = await fetchWithAuth(`http://localhost:3002/api/providers/${editingProvider.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });

                if (response && response.ok) {
                    showNotification('success', 'Updated', `${formData.name} has been updated successfully.`);
                    await loadProviders();
                } else {
                    showNotification('error', 'Error', 'Failed to update provider');
                }
            } else {
                // Create new provider
                const response = await fetchWithAuth('http://localhost:3002/api/providers', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                });

                if (response && response.ok) {
                    showNotification('success', 'Provider Added', `${formData.name} has been added successfully.`);
                    await loadProviders();
                } else {
                    showNotification('error', 'Error', 'Failed to create provider');
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving provider:', error);
            showNotification('error', 'Error', 'Failed to save provider');
        }
    };

    return (
        <>
            <DataTable
                columns={[
                    { key: "id", label: "ID", sortable: true, resizable: true, minWidth: 50 },
                    { key: "name", label: "Name", sortable: true, resizable: true },
                    { key: "category", label: "Category", sortable: true, resizable: true },
                    {
                        key: "status",
                        label: "Status",
                        sortable: true,
                        resizable: true,
                        render: (provider: Provider) => {
                            let color: "success" | "error" | "warning" | "light" = "light";
                            if (provider.status === "Active") color = "success";
                            else if (provider.status === "Inactive") color = "error";
                            else if (provider.status === "Pending") color = "warning";

                            return (
                                <Badge variant="light" color={color}>
                                    {provider.status}
                                </Badge>
                            );
                        }
                    },
                    { key: "description", label: "Description", sortable: true, resizable: true },
                    { key: "notes", label: "Notes", sortable: true, resizable: true },
                    {
                        key: "creation_date",
                        label: "Creation Date",
                        sortable: true,
                        resizable: true,
                        render: (provider: Provider) => {
                            if (!provider.creation_date) return "";
                            return new Date(provider.creation_date).toLocaleDateString();
                        }
                    },
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
                enableShowEntries={false}
                enableFilter={false}
                enableAutoFilter={false}
                enableDownload={false}
                onAddNew={handleAddNew}
                enableColumnMenu={false}
                enableSelection={false}
                initialSort={{ key: "id", direction: "asc" }}
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
                                    {editingProvider ? 'Edit Provider' : 'Add New Provider'}
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
                            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Creation Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.creation_date}
                                        onChange={(e) => setFormData({ ...formData, creation_date: e.target.value })}
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
                                    {editingProvider ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
