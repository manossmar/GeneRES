import { useState } from "react";
import DataTable from "../../common/DataTable";
import { useNotification } from "../../../context/NotificationContext";

interface Employee {
    id: number;
    name: string;
    position: string;
    office: string;
    age: number;
    startDate: string;
    salary: string;
}

const initialTableData: Employee[] = [
    {
        id: 1,
        name: "Tiger Nixon",
        position: "System Architect",
        office: "Edinburgh",
        age: 61,
        startDate: "2011/04/25",
        salary: "$320,800",
    },
    {
        id: 2,
        name: "Garrett Winters",
        position: "Accountant",
        office: "Tokyo",
        age: 63,
        startDate: "2011/07/25",
        salary: "$170,750",
    },
    {
        id: 3,
        name: "Ashton Cox",
        position: "Junior Technical Author",
        office: "San Francisco",
        age: 66,
        startDate: "2009/01/12",
        salary: "$86,000",
    },
    {
        id: 4,
        name: "Cedric Kelly",
        position: "Senior Javascript Developer",
        office: "Edinburgh",
        age: 22,
        startDate: "2012/03/29",
        salary: "$433,060",
    },
    {
        id: 5,
        name: "Airi Satou",
        position: "Accountant",
        office: "Tokyo",
        age: 33,
        startDate: "2008/11/28",
        salary: "$162,700",
    },
    {
        id: 6,
        name: "Brielle Williamson",
        position: "Integration Specialist",
        office: "New York",
        age: 61,
        startDate: "2012/12/02",
        salary: "$372,000",
    },
    {
        id: 7,
        name: "Herrod Chandler",
        position: "Sales Assistant",
        office: "San Francisco",
        age: 59,
        startDate: "2012/08/06",
        salary: "$137,500",
    },
    {
        id: 8,
        name: "Rhona Davidson",
        position: "Integration Specialist",
        office: "Tokyo",
        age: 55,
        startDate: "2010/10/14",
        salary: "$327,900",
    },
    {
        id: 9,
        name: "Colleen Hurst",
        position: "Javascript Developer",
        office: "San Francisco",
        age: 39,
        startDate: "2009/09/15",
        salary: "$205,500",
    },
    {
        id: 10,
        name: "Sonya Frost",
        position: "Software Engineer",
        office: "Edinburgh",
        age: 23,
        startDate: "2008/12/13",
        salary: "$103,600",
    },
    {
        id: 11,
        name: "Jena Gaines",
        position: "Office Manager",
        office: "London",
        age: 30,
        startDate: "2008/12/19",
        salary: "$90,560",
    },
    {
        id: 12,
        name: "Quinn Flynn",
        position: "Support Lead",
        office: "Edinburgh",
        age: 22,
        startDate: "2013/03/03",
        salary: "$342,000",
    },
    {
        id: 13,
        name: "Charde Marshall",
        position: "Regional Director",
        office: "San Francisco",
        age: 36,
        startDate: "2008/10/16",
        salary: "$470,600",
    },
    {
        id: 14,
        name: "Haley Kennedy",
        position: "Senior Marketing Designer",
        office: "London",
        age: 43,
        startDate: "2012/12/18",
        salary: "$313,500",
    },
    {
        id: 15,
        name: "Tatyana Fitzpatrick",
        position: "Regional Director",
        office: "London",
        age: 19,
        startDate: "2010/03/17",
        salary: "$385,750",
    },
];

export default function DataTable3() {
    const [tableData, setTableData] = useState<Employee[]>(initialTableData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
        name: "",
        position: "",
        office: "",
        age: 0,
        startDate: "",
        salary: "",
    });

    const { showConfirmation, showNotification } = useNotification();

    const handleEdit = (item: Employee) => {
        console.log("Edit item:", item);
        alert(`Edit ${item.name}`);
    };

    const handleDelete = (item: Employee) => {
        showConfirmation(
            "Delete Employee",
            `Are you sure you want to delete ${item.name}?`,
            () => {
                // On confirm: delete the employee
                setTableData((prev) => prev.filter((e) => e.id !== item.id));
                showNotification('success', 'Deleted', `${item.name} has been deleted successfully.`);
            },
            () => {
                // On cancel: do nothing (optional callback)
                console.log("Delete cancelled");
            }
        );
    };

    const handleSelectionChange = (selectedItems: Employee[]) => {
        console.log("Selected items:", selectedItems);
    };

    const handleAddNew = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: "",
            position: "",
            office: "",
            age: 0,
            startDate: "",
            salary: "",
        });
    };

    const handleSave = () => {
        const newEmployee: Employee = {
            id: Math.max(...tableData.map(e => e.id)) + 1,
            ...formData
        };
        setTableData([...tableData, newEmployee]);
        showNotification('success', 'Employee Added', `${formData.name} has been added successfully.`);
        handleCloseModal();
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
            />

            {/* Add New Modal */}
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
                                    Add New Employee
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
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
