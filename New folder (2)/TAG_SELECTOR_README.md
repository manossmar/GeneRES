# TagSelector Component

A standalone, reusable React component for selecting and managing tags with rich metadata and LocalStorage persistence.

## Features

- ✅ **Searchable Dropdown** - Real-time tag filtering
- ✅ **Rich Tag Properties** - Category, typename, description, charge, distance
- ✅ **Add New Tags** - Modal for creating tags on the fly
- ✅ **LocalStorage Persistence** - Tags persist across sessions
- ✅ **Visual Feedback** - Pills with metadata display
- ✅ **Fully Typed** - TypeScript support
- ✅ **Accessible** - Keyboard navigation and ARIA labels

## Installation

1. Copy the following files to your project:
   ```
   src/types/Tag.ts
   src/hooks/useTagsStore.ts
   src/components/form/AddTagModal.tsx
   src/components/form/TagSelector.tsx
   ```

2. Ensure you have the required dependencies:
   - React 16.8+
   - TypeScript
   - Tailwind CSS

## Usage

### Basic Example

```tsx
import React, { useState } from 'react';
import TagSelector from './components/form/TagSelector';

function MyForm() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div>
      <TagSelector
        selectedTagIds={selectedTags}
        onTagsChange={setSelectedTags}
        label="Tags"
        placeholder="Select or add tags..."
      />
    </div>
  );
}
```

### With Category Filter

```tsx
<TagSelector
  selectedTagIds={selectedTags}
  onTagsChange={setSelectedTags}
  label="Amenities"
  placeholder="Select amenities..."
  categoryFilter="amenity"  // Only show tags with category="amenity"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedTagIds` | `string[]` | Yes | Array of selected tag IDs |
| `onTagsChange` | `(tagIds: string[]) => void` | Yes | Callback when tags change |
| `label` | `string` | No | Label text above the component |
| `placeholder` | `string` | No | Placeholder text for the input |
| `categoryFilter` | `string` | No | Filter tags by category |

## Tag Structure

Each tag has the following properties:

```typescript
interface Tag {
  id: string;              // Unique identifier
  name: string;            // Display name
  category: string;        // Tag category (e.g., "amenity", "location")
  typename: string;        // Type classification
  description: string;     // Detailed description
  charge: boolean;         // Whether this tag implies additional charges
  distance?: string;       // Optional distance info (e.g., "500m")
  createdAt: number;       // Timestamp
}
```

## Styling

The component uses Tailwind CSS classes. Ensure your Tailwind config includes:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          // ... other shades
          500: '#3b82f6',
          600: '#2563eb',
          // ... other shades
        },
      },
    },
  },
};
```

Or replace `brand-*` classes with your own color scheme.

## LocalStorage

Tags are automatically saved to LocalStorage under the key `hotel-tags`. This means:
- Tags persist across page refreshes
- Tags are shared across all instances of the component
- Tags are browser-specific (not synced across devices)

To clear all tags:
```javascript
localStorage.removeItem('hotel-tags');
```

## Customization

### Custom Storage Key

Edit `useTagsStore.ts`:
```typescript
const STORAGE_KEY = 'my-custom-tags-key';
```

### Custom Styling

All components use Tailwind classes. You can:
1. Modify the classes directly in the component files
2. Use Tailwind's `@apply` directive in your CSS
3. Wrap the component and override styles

## Examples

### Example 1: Hotel Amenities

```tsx
<TagSelector
  selectedTagIds={formData.amenityTagIds}
  onTagsChange={(ids) => setFormData({...formData, amenityTagIds: ids})}
  label="Hotel Amenities"
  placeholder="Select amenities..."
  categoryFilter="amenity"
/>
```

### Example 2: Product Categories

```tsx
<TagSelector
  selectedTagIds={product.categoryIds}
  onTagsChange={(ids) => updateProduct({categoryIds: ids})}
  label="Categories"
  placeholder="Select categories..."
/>
```

### Example 3: Location Tags

```tsx
<TagSelector
  selectedTagIds={location.tagIds}
  onTagsChange={(ids) => setLocation({...location, tagIds: ids})}
  label="Location Features"
  placeholder="Select features..."
  categoryFilter="location"
/>
```

## API Reference

### useTagsStore Hook

```typescript
const {
  tags,              // All tags
  addTag,            // Add a new tag
  updateTag,         // Update existing tag
  removeTag,         // Remove a tag
  getTagById,        // Get tag by ID
  getTagsByIds,      // Get multiple tags by IDs
  searchTags,        // Search tags
  getAllTags,        // Get all tags
} = useTagsStore();
```

### Adding Tags Programmatically

```typescript
import { useTagsStore } from './hooks/useTagsStore';

function MyComponent() {
  const { addTag } = useTagsStore();
  
  const createTag = () => {
    const newTag = addTag({
      name: 'Swimming Pool',
      category: 'amenity',
      typename: 'recreation',
      description: 'Outdoor pool with sun loungers',
      charge: true,
      distance: '50m',
    });
    
    console.log('Created tag:', newTag.id);
  };
}
```

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- IE11: ❌ (requires polyfills)

## License

MIT

## Support

For issues or questions, please refer to the walkthrough document or contact the development team.
