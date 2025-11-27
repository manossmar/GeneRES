import React, { useState, useRef, useEffect } from 'react';
import { Tag } from '../../types/Tag';
import { useTagsStore } from '../../hooks/useTagsStore';
import AddTagModal from './AddTagModal';

interface TagSelectorProps {
    selectedTagIds: string[];
    onTagsChange: (tagIds: string[]) => void;
    placeholder?: string;
    label?: string;
    categoryFilter?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
    selectedTagIds,
    onTagsChange,
    placeholder = 'Select or add tags...',
    label,
    categoryFilter,
}) => {
    const { tags, addTag, updateTag, getTagsByIds, searchTags } = useTagsStore();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get selected tags
    const selectedTags = getTagsByIds(selectedTagIds);

    // Get filtered tags and sort them (selected first)
    let filteredTags = searchQuery
        ? searchTags(searchQuery)
        : categoryFilter
            ? tags.filter(tag => tag.category === categoryFilter)
            : tags;

    // Sort: selected tags first, then alphabetically
    filteredTags = [...filteredTags].sort((a, b) => {
        const aSelected = selectedTagIds.includes(a.id);
        const bSelected = selectedTagIds.includes(b.id);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.name.localeCompare(b.name);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter(id => id !== tagId));
        } else {
            onTagsChange([...selectedTagIds, tagId]);
        }
    };

    const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onTagsChange(selectedTagIds.filter(id => id !== tagId));
    };

    const handleAddNewTag = (tagInput: any) => {
        const newTag = addTag(tagInput);
        onTagsChange([...selectedTagIds, newTag.id]);
        setIsModalOpen(false);
        setEditingTag(null);
        setSearchQuery('');
    };

    const handleEditTag = (tag: Tag, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTag(tag);
        setIsModalOpen(true);
    };

    const handleUpdateTag = (id: string, tagInput: any) => {
        updateTag(id, tagInput);
        setIsModalOpen(false);
        setEditingTag(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTag(null);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                        <div
                            key={tag.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 text-sm"
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-brand-700 dark:text-brand-300">{tag.name}</span>
                                    {tag.charge && (
                                        <span className="text-xs" title="Additional charge">💰</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400">
                                    <span>{tag.category}</span>
                                    {tag.distance && (
                                        <>
                                            <span>•</span>
                                            <span>📍 {tag.distance}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleRemoveTag(tag.id, e)}
                                className="text-brand-400 hover:text-brand-600 dark:hover:text-brand-200 transition-colors"
                                title="Remove tag"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Field */}
            <div
                className="relative cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="flex-1 text-gray-500 dark:text-gray-400">{placeholder}</span>
                    <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    {/* Search and Add New */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Search tags..."
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModalOpen(true);
                                }}
                                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors whitespace-nowrap"
                            >
                                + Add New
                            </button>
                        </div>
                    </div>

                    {/* Tags List */}
                    <div className="max-h-64 overflow-y-auto p-2">
                        {filteredTags.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No tags found' : 'No tags available'}
                            </div>
                        ) : (
                            filteredTags.map(tag => {
                                const isSelected = selectedTagIds.includes(tag.id);
                                return (
                                    <div
                                        key={tag.id}
                                        className={`cursor-pointer rounded-lg p-2 transition-colors ${isSelected
                                                ? 'bg-brand-50 dark:bg-brand-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {/* Checkbox */}
                                            <div
                                                className="flex-shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleTag(tag.id);
                                                }}
                                            >
                                                <div
                                                    className={`h-4 w-4 rounded border-2 flex items-center justify-center ${isSelected
                                                            ? 'border-brand-500 bg-brand-500'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tag Content */}
                                            <div
                                                className="flex-1 min-w-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleTag(tag.id);
                                                }}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{tag.name}</span>
                                                    {tag.charge && (
                                                        <span className="text-xs flex-shrink-0" title="Additional charge">💰</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs">{tag.category}</span>
                                                    {tag.typename && <span className="truncate">• {tag.typename}</span>}
                                                    {tag.distance && <span className="flex-shrink-0">• 📍 {tag.distance}</span>}
                                                </div>
                                            </div>

                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => handleEditTag(tag, e)}
                                                className="flex-shrink-0 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1"
                                                title="Edit tag"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Tag Modal */}
            <AddTagModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddNewTag}
                editTag={editingTag}
                onUpdate={handleUpdateTag}
            />
        </div>
    );
};

export default TagSelector;
