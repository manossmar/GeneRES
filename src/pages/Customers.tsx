import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import Switch from "../components/form/switch/Switch";

export default function Customers() {
    return (
        <div>
            <PageMeta
                title="Customers | TailAdmin - React.js Admin Dashboard Template"
                description="This is Customers page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Customers" />
            <div className="grid grid-cols-1 gap-6">
                <ComponentCard title="Customer Details">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input type="text" id="firstName" placeholder="Enter first name" />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input type="text" id="lastName" placeholder="Enter last name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input type="email" id="email" placeholder="Enter email address" />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input type="text" id="phone" placeholder="Enter phone number" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input type="text" id="address" placeholder="Enter street address" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input type="text" id="city" placeholder="Enter city" />
                            </div>
                            <div>
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input type="text" id="zipCode" placeholder="Enter zip code" />
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input type="text" id="country" placeholder="Enter country" />
                            </div>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Switch
                                label="Active"
                                defaultChecked={true}
                                onChange={(checked) => console.log("Active status:", checked)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button size="sm" variant="primary">
                                Save Customer
                            </Button>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
