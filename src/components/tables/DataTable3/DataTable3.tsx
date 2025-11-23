import DataTable from "../../common/DataTable";

interface Employee {
    id: number;
    name: string;
    position: string;
    office: string;
    age: number;
    startDate: string;
    salary: string;
}

const tableData: Employee[] = [
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
    const handleEdit = (item: Employee) => {
        console.log("Edit item:", item);
        alert(`Edit ${item.name}`);
    };

    const handleDelete = (item: Employee) => {
        console.log("Delete item:", item);
        alert(`Delete ${item.name}`);
    };

    const handleSelectionChange = (selectedItems: Employee[]) => {
        console.log("Selected items:", selectedItems);
    };

    return (
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
            onSelectionChange={handleSelectionChange}
            enableSearch={true}
            enablePagination={true}
            enableShowEntries={true}
            enableFilter={true}
            enableAutoFilter={true}
            enableDownload={true}
        />
    );
}
