import { useState, useEffect } from 'react';

export interface DragDropState {
    draggingColumn: string | null;
    dragOverColumn: string | null;
    dragToHide: boolean;
    dragStartY: number;
}

export interface DragDropHandlers {
    handleDragStart: (e: React.DragEvent, columnKey: string) => void;
    handleDragOver: (e: React.DragEvent, columnKey: string) => void;
    handleDragLeave: () => void;
    handleDrop: (e: React.DragEvent, targetKey: string, onReorder: (sourceKey: string, targetKey: string) => void, onHide: (columnKey: string) => void) => void;
    handleDragEnd: () => void;
}

export const useColumnDragDrop = (onHideColumn?: (key: string) => void): [DragDropState, DragDropHandlers] => {
    const [draggingColumn, setDraggingColumn] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [dragToHide, setDragToHide] = useState(false);
    const [dragStartY, setDragStartY] = useState<number>(0);

    // Global dragover listener for Chrome compatibility and drag-to-hide anywhere
    useEffect(() => {
        if (!draggingColumn) return;

        const handleGlobalDragOver = (e: DragEvent) => {
            e.preventDefault(); // Allow dropping anywhere for "hide" action

            const dragDistance = e.clientY - dragStartY;
            const shouldHide = dragDistance > 150;

            setDragToHide(shouldHide);

            if (shouldHide) {
                setDragOverColumn(null);
            }
        };

        const handleGlobalDrop = (e: DragEvent) => {
            const dragDistance = e.clientY - dragStartY;
            if (dragDistance > 150 && draggingColumn && onHideColumn) {
                e.preventDefault();
                e.stopPropagation();
                onHideColumn(draggingColumn);
                setDraggingColumn(null);
                setDragOverColumn(null);
                setDragToHide(false);
            }
        };

        document.addEventListener('dragover', handleGlobalDragOver);
        document.addEventListener('drop', handleGlobalDrop);
        document.body.style.userSelect = 'none'; // Prevent text selection globally
        document.body.style.webkitUserSelect = 'none';

        return () => {
            document.removeEventListener('dragover', handleGlobalDragOver);
            document.removeEventListener('drop', handleGlobalDrop);
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
        };
    }, [draggingColumn, dragStartY, onHideColumn]);

    const handleDragStart = (e: React.DragEvent, columnKey: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', columnKey);
        setDraggingColumn(columnKey);
        setDragStartY(e.clientY);
        setDragToHide(false);

        // Create custom drag image (the header itself)
        const target = e.currentTarget as HTMLElement;
        const clone = target.cloneNode(true) as HTMLElement;
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        clone.style.width = target.offsetWidth + 'px';
        clone.style.opacity = '0.8';
        document.body.appendChild(clone);
        e.dataTransfer.setDragImage(clone, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setTimeout(() => document.body.removeChild(clone), 0);
    };

    const handleDragOver = (e: React.DragEvent, columnKey: string) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent global listener from overriding
        e.dataTransfer.dropEffect = 'move';

        // We are over a column, so we are NOT hiding
        setDragToHide(false);
        setDragOverColumn(columnKey);
    };

    const handleDragLeave = () => {
        // Do NOT reset dragOverColumn here. 
        // It causes flickering when dragging over child elements (like text/icons in header).
        // The global listener or other column's dragOver will handle switching.
    };

    const handleDrop = (
        e: React.DragEvent,
        targetKey: string,
        onReorder: (sourceKey: string, targetKey: string) => void,
        onHide: (columnKey: string) => void
    ) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent global drop listener from firing
        const sourceKey = e.dataTransfer.getData('text/plain');

        // Check if this is a drag-to-hide action (fallback if global didn't catch it)
        if (dragToHide) {
            onHide(sourceKey);
            setDraggingColumn(null);
            setDragOverColumn(null);
            setDragToHide(false);
            return;
        }

        if (sourceKey !== targetKey) {
            onReorder(sourceKey, targetKey);
        }

        setDraggingColumn(null);
        setDragOverColumn(null);
        setDragToHide(false);
    };

    const handleDragEnd = () => {
        setDraggingColumn(null);
        setDragOverColumn(null);
        setDragToHide(false);
    };

    return [
        { draggingColumn, dragOverColumn, dragToHide, dragStartY },
        { handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd }
    ];
};
