import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import HotelsTable from "../components/tables/HotelsTable/HotelsTable";

export default function Hotels() {
    return (
        <>
            <PageMeta
                title="Hotels | TailAdmin - React.js Admin Dashboard Template"
                description="This is Hotels page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Hotels" />
            <div className="space-y-6">
                <ComponentCard title="Hotel Data">
                    <HotelsTable />
                </ComponentCard>
            </div>
        </>
    );
}
