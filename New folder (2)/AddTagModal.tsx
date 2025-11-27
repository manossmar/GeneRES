import React, { useState, useEffect } from 'react';
import { CreateTagInput, Tag } from '../../types/Tag';

interface AddTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tag: CreateTagInput) => void;
    editTag?: Tag | null; // Optional tag to edit
    onUpdate?: (id: string, tag: CreateTagInput) => void; // For updating existing tags
}

const AddTagModal: React.FC<AddTagModalProps> = ({ isOpen, onClose, onSave, editTag, onUpdate }) => {
    const [formData, setFormData] = useState<CreateTagInput>({
        name: '',
        category: '',
        typename: '',
        description: '',
        charge: false,
        distance: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateTagInput, string>>>({});

    // Pre-fill form when editing
    useEffect(() => {
        if (editTag) {
            setFormData({
                name: editTag.name,
                category: editTag.category,
                typename: editTag.typename,
                description: editTag.description,
                charge: editTag.charge,
                distance: editTag.distance || '',
            });
        }
    }, [editTag]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error for this field
        if (errors[name as keyof CreateTagInput]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateTagInput, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
        }
        if (!formData.typename.trim()) {
            newErrors.typename = 'Type name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            const tagData = {
                ...formData,
                distance: formData.distance?.trim() || undefined,
            };

            if (editTag && onUpdate) {
                onUpdate(editTag.id, tagData);
            } else {
                onSave(tagData);
            }
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            category: '',
            typename: '',
            description: '',
            charge: false,
            distance: '',
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editTag ? 'Edit Tag' : 'Add New Tag'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                } bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                            placeholder="e.g., Swimming Pool"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Category and Type Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={`w-full rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    } bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                                placeholder="e.g., Amenity"
                            />
                            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="typename"
                                value={formData.typename}
                                onChange={handleChange}
                                className={`w-full rounded-lg border ${errors.typename ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    } bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
                                placeholder="e.g., Recreation"
                            />
                            {errors.typename && <p className="mt-1 text-sm text-red-500">{errors.typename}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            placeholder="Detailed description of the tag..."
                        />
                    </div>

                    {/* Charge and Distance */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="charge"
                                id="charge"
                                checked={formData.charge}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <label htmlFor="charge" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Additional Charge
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Distance (optional)
                            </label>
                            <input
                                type="text"
                                name="distance"
                                value={formData.distance}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                placeholder="e.g., 500m, 2km"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                        >
                            {editTag ? 'Update Tag' : 'Add Tag'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTagModal;
