# Enhanced Column Management Implementation

## File to Replace
`src/components/common/DataTable.tsx` lines 691-762

## Replacement Code

Replace the `{columns.map((column) => {` section with:

```tsx
{columnOrder
    .filter(key => visibleColumns.has(key))
    .map((key) => {
        const column = columns.find(col => String(col.key) === key);
        if (!column) return null;

        const width = columnWidths[String(column.key)] || "auto";
        const isDragging = dragState.draggingColumn === String(column.key);
        const isDropTarget = dragState.dragOverColumn === String(column.key);

        return (
            <TableCell
                key={String(column.key)}
                isHeader
                draggable
                onDragStart={(e) => dragHandlers.handleDragStart(e, String(column.key))}
                onDragOver={(e) => dragHandlers.handleDragOver(e, String(column.key))}
                onDragLeave={dragHandlers.handleDragLeave}
                onDrop={(e) => dragHandlers.handleDrop(e, String(column.key), handleColumnReorder, handleHideColumn)}
                onDragEnd={dragHandlers.handleDragEnd}
                onContextMenu={(e) => {
                    e.preventDefault();
                    handleColumnMenuClick(e, String(column.key));
                }}
                className={`relative px-5 py-2.5 font-bold text-gray-700 text-start text-sm dark:text-gray-200 border-r border-gray-200 dark:border-white/[0.05] ${
                    column.sortable
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                        : ""
                } ${isDragging ? "opacity-50" : ""} ${
                    isDropTarget ? "bg-brand-100 dark:bg-brand-900/30 border-l-4 border-l-brand-500" : ""
                } cursor-move transition-all duration-200`}
                style={{ width, minWidth: column.minWidth || 100 }}
            >
                <div
                    className="flex items-center justify-between gap-2 h-full"
                    onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('.column-dropdown')) {
                            column.sortable && handleSort(column.key);
                        }
                    }}
                >
                    <span className="truncate">{column.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                        {column.sortable && (
                            <div className="flex flex-col gap-0.5">
                                <svg
                                    className={`w-2.5 h-2.5 ${
                                        sortConfig?.key === column.key &&
                                        sortConfig.direction === "asc"
                                            ? "text-brand-500 scale-125 font-bold"
                                            : "text-gray-300 dark:text-gray-600"
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 15l7-7 7 7"
                                    />
                                </svg>
                                <svg
                                    className={`w-2.5 h-2.5 ${
                                        sortConfig?.key === column.key &&
                                        sortConfig.direction === "desc"
                                            ? "text-brand-500 scale-125 font-bold"
                                            : "text-gray-300 dark:text-gray-600"
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        )}
                        <button
                            className="column-dropdown p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            onClick={(e) => handleColumnMenuClick(e, String(column.key))}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Drag-to-Hide X Overlay */}
                {isDragging && dragState.dragToHide && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none z-50">
                        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}

                {/* Column Dropdown Menu */}
                {activeDropdown === String(column.key) && (
                    <div className="column-dropdown absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-1">
                        {/* Section 1: Column-Specific Options */}
                        {column.numeric && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSumColumns(prev => new Set(prev).add(String(column.key)));
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Sum Column
                                </button>
                            </>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleHideColumn(String(column.key));
                            }}
                            className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Hide Column
                        </button>
                        
                        {/* Section 2: Sort Options */}
                        {column.sortable && (
                            <>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSortConfig({ key: column.key, direction: "asc" });
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                    </svg>
                                    Sort Ascending
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSortConfig({ key: column.key, direction: "desc" });
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                    </svg>
                                    Sort Descending
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSortConfig(null);
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Sorting
                                </button>
                            </>
                        )}
                        
                        {/* Section 3: Column Chooser (Always at Bottom) */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setColumnChooserOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                                Column Chooser
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Column Chooser Submenu */}
                        {columnChooserOpen && (
                            <div className="column-dropdown absolute right-full top-0 mr-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {columns.map(col => (
                                        <label
                                            key={String(col.key)}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns.has(String(col.key))}
                                                onChange={() => toggleColumnVisibility(String(col.key))}
                                                className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                            />
                                            <span className="text-sm font-normal text-gray-700 dark:text-gray-200">{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleAllColumns();
                                        }}
                                        className="flex-1 px-2 py-1 text-xs font-normal bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Show/Hide All
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resetColumns();
                                        }}
                                        className="flex-1 px-2 py-1 text-xs font-normal bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {column.resizable && (
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-brand-500 z-10"
                        onMouseDown={(e) =>
                            startResizing(
                                e,
                                String(column.key),
                                e.currentTarget.parentElement?.offsetWidth || 100
                            )
                        }
                    />
                )}
            </TableCell>
        );
    })}
```

## Key Changes:
1. **columnOrder.filter(visibleColumns)** - Respects column order and visibility
2. **dragState & dragHandlers** - Uses custom hook
3. **Enhanced drop target** - `bg-brand-100` for better visibility
4. **X overlay** - Shows when `dragToHide` is true
5. **Smaller buttons** - Column Chooser uses `px-2 py-1 text-xs`
6. **Complete dropdown menu** - All sections with proper icons
