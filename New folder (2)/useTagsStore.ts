import { useState, useEffect } from 'react';
import { Tag, CreateTagInput } from '../types/Tag';

const STORAGE_KEY = 'hotel-tags';

// Generate unique ID
const generateId = (): string => {
    return `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Load tags from localStorage
const loadTags = (): Tag[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading tags from localStorage:', error);
        return [];
    }
};

// Save tags to localStorage
const saveTags = (tags: Tag[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    } catch (error) {
        console.error('Error saving tags to localStorage:', error);
    }
};

export const useTagsStore = () => {
    const [tags, setTags] = useState<Tag[]>([]);

    // Load tags on mount
    useEffect(() => {
        setTags(loadTags());
    }, []);

    // Save tags whenever they change
    useEffect(() => {
        if (tags.length > 0 || loadTags().length > 0) {
            saveTags(tags);
        }
    }, [tags]);

    const addTag = (input: CreateTagInput): Tag => {
        const newTag: Tag = {
            ...input,
            id: generateId(),
            createdAt: Date.now(),
        };

        setTags(prev => [...prev, newTag]);
        return newTag;
    };

    const updateTag = (id: string, updates: Partial<Tag>): void => {
        setTags(prev =>
            prev.map(tag => (tag.id === id ? { ...tag, ...updates } : tag))
        );
    };

    const removeTag = (id: string): void => {
        setTags(prev => prev.filter(tag => tag.id !== id));
    };

    const getTagById = (id: string): Tag | undefined => {
        return tags.find(tag => tag.id === id);
    };

    const getTagsByIds = (ids: string[]): Tag[] => {
        return tags.filter(tag => ids.includes(tag.id));
    };

    const searchTags = (query: string): Tag[] => {
        if (!query.trim()) return tags;

        const lowerQuery = query.toLowerCase();
        return tags.filter(
            tag =>
                tag.name.toLowerCase().includes(lowerQuery) ||
                tag.category.toLowerCase().includes(lowerQuery) ||
                tag.typename.toLowerCase().includes(lowerQuery) ||
                tag.description.toLowerCase().includes(lowerQuery)
        );
    };

    const getAllTags = (): Tag[] => {
        return tags;
    };

    return {
        tags,
        addTag,
        updateTag,
        removeTag,
        getTagById,
        getTagsByIds,
        searchTags,
        getAllTags,
    };
};
