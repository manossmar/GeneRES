import React, { useState, useRef, useEffect } from 'react';

interface ColumnChooserModalProps {
    columns: Array<{ key: string; label: string }>;
    visibleColumns: Set<string>;
    onToggleColumn: (key: string) => void;
    onToggleAll: () => void;
    onReset: () => void;
    onClose: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ColumnChooserModal: React.FC<ColumnChooserModalProps> = ({
    columns,
    visibleColumns,
    onToggleColumn,
    onToggleAll,
    onReset,
    onClose,
    containerRef
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isPositioned, setIsPositioned] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Center the modal relative to the table container on mount
    useEffect(() => {
        if (modalRef.current && containerRef.current) {
            const modalRect = modalRef.current.getBoundingClientRect();
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;

            setPosition({
                x: (containerWidth - modalRect.width) / 2,
                y: (containerHeight - modalRect.height) / 2
            });
            setIsPositioned(true);
        }
    }, [containerRef]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.modal-header')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
            document.body.style.userSelect = 'none';
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && modalRef.current && containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const containerHeight = containerRef.current.offsetHeight;
                const modalWidth = modalRef.current.offsetWidth;
                const modalHeight = modalRef.current.offsetHeight;

                let newX = e.clientX - dragOffset.x;
                let newY = e.clientY - dragOffset.y;

                // Constrain to container bounds
                if (newX < 0) newX = 0;
                if (newX + modalWidth > containerWidth) newX = containerWidth - modalWidth;
                if (newY < 0) newY = 0;
                if (newY + modalHeight > containerHeight) newY = containerHeight - modalHeight;

                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.userSelect = '';
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, containerRef]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => {
                    // Don't close if we're dragging
                    if (!isDragging) {
                        onClose();
                    }
                }}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: '220px',
                    cursor: isDragging ? 'grabbing' : 'default'
                }}
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()}
                className={`absolute z-50 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl select-none transition-opacity duration-150 ${isPositioned ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Header */}
                <div className="modal-header flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 rounded-t-lg cursor-grab active:cursor-grabbing">
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Column Chooser
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-64 overflow-y-auto p-2">
                    {[...columns].sort((a, b) => a.label.localeCompare(b.label)).map(col => (
                        <label
                            key={col.key}
                            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={visibleColumns.has(col.key)}
                                onChange={() => onToggleColumn(col.key)}
                                className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
                            />
                            <span className="text-xs font-normal text-gray-700 dark:text-gray-200 truncate">{col.label}</span>
                        </label>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 dark:border-gray-600 p-2 flex gap-2">
                    <button
                        onClick={onToggleAll}
                        className="flex-1 px-2 py-1 text-xs font-normal bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Show/Hide All
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReset();
                        }}
                        className="flex-1 px-2 py-1 text-xs font-normal bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div >
        </>
    );
};
