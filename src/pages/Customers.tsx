
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import CustomerTable from "../components/tables/CustomerTable/CustomerTable";

export default function Customers() {
    return (
        <>
            <PageMeta
                title="Customers | TailAdmin - React.js Admin Dashboard Template"
                description="This is Customers page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />

            <div className="space-y-6">
                <ComponentCard title="Customer Data">
                    <CustomerTable />
                </ComponentCard>
            </div>
        </>
    );
}
