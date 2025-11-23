import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DataTable3 from "../../components/tables/DataTable3/DataTable3";

export default function DataTable3Page() {
    return (
        <>
            <PageMeta
                title="Data Table 3 | TailAdmin - Next.js Admin Dashboard Template"
                description="This is Data Table 3 page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Data Table 3" />
            <div className="space-y-6">
                <ComponentCard title="Data Table 3">
                    <DataTable3 />
                </ComponentCard>
            </div>
        </>
    );
}
