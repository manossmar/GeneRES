import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useNotification } from '../../context/NotificationContext';

export default function EditProfile() {
    const { user, token, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        bio: '',
        country: '',
        city: '',
        postal_code: '',
        tax_id: '',
    });
    const [initialFormData, setInitialFormData] = useState({});
    const [picture, setPicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            const initialData = {
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                country: user.country || '',
                city: user.city_state || '',
                postal_code: user.postal_code || '',
                tax_id: user.tax_id || '',
            };
            setFormData(initialData);
            setInitialFormData(initialData);

            if (user.picture && token) {
                const picUrl = user.picture.startsWith('/') ? `http://localhost:3002${user.picture}?token=${token}&t=${new Date().getTime()}` : user.picture;
                setPreviewUrl(picUrl);
            }
        }
    }, [user, token]);

    useEffect(() => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData) || picture !== null;
        setIsDirty(hasChanges);
    }, [formData, initialFormData, picture]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDeletePhoto = async () => {
        if (!user || !token) return;

        try {
            const formData = new FormData();
            formData.append('deletePicture', 'true');

            const response = await fetch(`http://localhost:3002/api/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                setPicture(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';

                const updatedUser = { ...user, picture: undefined };
                updateUser(updatedUser);

                showNotification('success', 'Success', 'Photo deleted successfully');
            } else {
                showNotification('error', 'Error', 'Failed to delete photo');
            }
        } catch (error) {
            showNotification('error', 'Error', 'An error occurred');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !token) return;

        try {
            // Helper function to remove extra spaces between words
            const normalizeSpaces = (str: string): string => {
                return str.trim().replace(/\s+/g, ' ');
            };

            // Helper function to convert to Title Case
            const toTitleCase = (str: string): string => {
                return str
                    .trim()
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            };

            // Sanitize form data
            const sanitizedData = {
                first_name: toTitleCase(normalizeSpaces(formData.first_name)),
                last_name: toTitleCase(normalizeSpaces(formData.last_name)),
                email: formData.email.trim().toLowerCase(),
                phone: normalizeSpaces(formData.phone),
                country: normalizeSpaces(formData.country),
                city: normalizeSpaces(formData.city),
                postal_code: normalizeSpaces(formData.postal_code),
                tax_id: normalizeSpaces(formData.tax_id),
                bio: normalizeSpaces(formData.bio),
            };

            const data = new FormData();
            Object.entries(sanitizedData).forEach(([key, value]) => {
                if (key === 'city') data.append('city_state', value);
                else data.append(key, value);
            });

            if (picture) {
                data.append('picture', picture);
            }

            const response = await fetch(`http://localhost:3002/api/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            if (response.ok) {
                const userResponse = await fetch(`http://localhost:3002/api/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const updatedUser = await userResponse.json();

                updateUser(updatedUser);
                setInitialFormData(sanitizedData);
                setPicture(null);
                setIsDirty(false);
                showNotification('success', 'Success', 'Profile updated successfully');
            } else {
                showNotification('error', 'Error', 'Failed to update profile');
            }
        } catch (error) {
            showNotification('error', 'Error', 'An error occurred');
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Profile" />
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-6 py-5">
                    <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                        Edit User Profile
                    </h3>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 flex items-center gap-5">
                            <div className="relative h-14 w-14 rounded-full overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="mb-1.5 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                    Edit your photo
                                </span>
                                <span className="flex gap-2.5">
                                    <label htmlFor="profile-upload" className="text-theme-xs cursor-pointer text-brand-500 hover:text-brand-600 dark:text-brand-400">
                                        Update
                                    </label>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDeletePhoto}
                                        className="text-theme-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Delete
                                    </button>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Postal Code</label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Tax ID</label>
                                <input
                                    type="text"
                                    name="tax_id"
                                    value={formData.tax_id}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Bio</label>
                                <textarea
                                    name="bio"
                                    rows={3}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="submit"
                                disabled={!isDirty}
                                className={`px-6 py-2 text-white rounded-lg ${isDirty ? 'bg-brand-500 hover:bg-brand-600' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
