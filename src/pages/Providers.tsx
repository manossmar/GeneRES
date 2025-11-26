
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import ProvidersTable from "../components/tables/ProvidersTable/ProvidersTable";

export default function Providers() {
    return (
        <>
            <PageMeta
                title="Providers | TailAdmin - React.js Admin Dashboard Template"
                description="This is Providers page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />

            <div className="space-y-6">
                <ComponentCard title="Provider Data">
                    <ProvidersTable />
                </ComponentCard>
            </div>
        </>
    );
}
