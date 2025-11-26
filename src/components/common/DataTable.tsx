import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useColumnDragDrop } from '../../hooks/useColumnDragDrop';
import { ColumnChooserModal } from './ColumnChooserModal';



interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    resizable?: boolean;
    render?: (item: T) => React.ReactNode;
    minWidth?: number;
    numeric?: boolean;
}

interface ActionButton<T> {
    label: string;
    icon: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'default' | 'danger';
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    actionButtons?: ActionButton<T>[];
    showEdit?: boolean;
    showDelete?: boolean;
    onAddNew?: () => void;
    addNewButtonLabel?: string;
    enableSearch?: boolean;
    enablePagination?: boolean;
    enableDownload?: boolean;
    enableFilter?: boolean;
    enableShowEntries?: boolean;
    enableAutoFilter?: boolean;
    onSelectionChange?: (selectedItems: T[]) => void;
    enableColumnMenu?: boolean;
    enableSelection?: boolean;
    initialVisibleColumns?: string[];
    initialSort?: {
        key: keyof T;
        direction: "asc" | "desc";
    };
}

export default function DataTable<T extends { id: number | string }>({
    columns,
    data,
    onEdit,
    onDelete,
    actionButtons,
    showEdit = true,
    showDelete = true,
    onAddNew,
    addNewButtonLabel,
    enableSearch = true,
    enablePagination = true,
    enableDownload = false,
    enableFilter = false,
    enableShowEntries = true,
    enableAutoFilter = false,
    onSelectionChange,
    enableColumnMenu = true,
    enableSelection = true,
    initialVisibleColumns,
    initialSort,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T;
        direction: "asc" | "desc";
    } | null>(initialSort || null);
    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
        new Set()
    );

    // Column Resizing State
    const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
    const [originalColumnWidths, setOriginalColumnWidths] = useState<{ [key: string]: number }>({});
    const resizingRef = useRef<{
        key: string;
        startX: number;
        startWidth: number;
    } | null>(null);

    // Minimal width threshold for showing only dots (very small - only when text is completely unreadable)
    const MINIMAL_COLUMN_WIDTH = 15;

    // AutoFilter State
    const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});

    // Filter Selected State
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    // Sum Column State
    const [sumColumns, setSumColumns] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        columnKey: string | null;
    }>({ visible: false, x: 0, y: 0, columnKey: null });

    // Copy Feedback State
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Download Menu State
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

    // Column Management State
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
    const [defaultColumnOrder, setDefaultColumnOrder] = useState<string[]>([]);
    const [defaultVisibleColumns, setDefaultVisibleColumns] = useState<Set<string>>(new Set());
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [columnChooserOpen, setColumnChooserOpen] = useState(false);

    // Column Management Handlers
    const toggleColumnVisibility = (columnKey: string) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnKey)) {
                if (newSet.size > 1) {
                    newSet.delete(columnKey);
                }
            } else {
                newSet.add(columnKey);
            }
            return newSet;
        });
    };

    const toggleAllColumns = () => {
        const allKeys = columns.map(col => String(col.key));
        if (visibleColumns.size === allKeys.length) {
            const firstKey = allKeys[0];
            setVisibleColumns(new Set([firstKey]));
        } else {
            setVisibleColumns(new Set(allKeys));
        }
    };

    const resetColumns = () => {
        setColumnOrder([...defaultColumnOrder]);
        setVisibleColumns(new Set(defaultVisibleColumns));
        setActiveDropdown(null);
    };

    const handleHideColumn = (columnKey: string) => {
        toggleColumnVisibility(columnKey);
        setActiveDropdown(null);
        setColumnChooserOpen(false);
    };

    // Use custom drag-drop hook
    const [dragState, dragHandlers] = useColumnDragDrop(handleHideColumn);

    const containerRef = useRef<HTMLDivElement>(null);

    // Reset selection when data changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [data]);

    // Notify parent of selection change
    useEffect(() => {
        if (onSelectionChange) {
            const selectedItems = data.filter((item) => selectedIds.has(item.id));
            onSelectionChange(selectedItems);
        }
    }, [selectedIds, data, onSelectionChange]);

    // Reset filter selected mode when selection becomes empty
    useEffect(() => {
        if (showSelectedOnly && selectedIds.size === 0) {
            setShowSelectedOnly(false);
        }
    }, [selectedIds, showSelectedOnly]);

    // Handle Resize Events
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingRef.current) return;

            const { key, startX, startWidth } = resizingRef.current;
            const diff = e.clientX - startX;
            const newWidth = Math.max(10, startWidth + diff); // Minimum width 10px

            setColumnWidths((prev) => ({
                ...prev,
                [key]: newWidth,
            }));
        };

        const handleMouseUp = () => {
            if (resizingRef.current) {
                resizingRef.current = null;
                document.body.style.cursor = "default";
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    // Initialize column order and visibility
    useEffect(() => {
        const initialOrder = columns.map(col => String(col.key));
        const initialVisible = initialVisibleColumns && initialVisibleColumns.length > 0
            ? new Set(initialVisibleColumns)
            : new Set(columns.map(col => String(col.key)));

        // Store original widths for double-click restore
        const origWidths: { [key: string]: number } = {};
        columns.forEach(col => {
            origWidths[String(col.key)] = 150; // Default width
        });
        setOriginalColumnWidths(origWidths);

        setColumnOrder(initialOrder);
        setVisibleColumns(initialVisible);
        setDefaultColumnOrder(initialOrder);
        setDefaultVisibleColumns(initialVisible);
    }, [columns, initialVisibleColumns]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.column-dropdown')) {
                setActiveDropdown(null);
                setColumnChooserOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);


    const startResizing = (
        e: React.MouseEvent,
        key: string,
        currentWidth: number
    ) => {
        e.preventDefault();
        e.stopPropagation();
        resizingRef.current = {
            key,
            startX: e.clientX,
            startWidth: currentWidth,
        };
        document.body.style.cursor = "col-resize";
    };

    const handleRestoreColumnWidth = (key: string) => {
        const originalWidth = originalColumnWidths[key] || 150;
        setColumnWidths(prev => ({
            ...prev,
            [key]: originalWidth,
        }));
    };

    const handleSort = (key: keyof T) => {
        let direction: "asc" | "desc" = "asc";
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "asc"
        ) {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(currentData.map((item) => item.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: number | string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleColumnFilterChange = (key: string, value: string) => {
        setColumnFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1);
    };

    const clearColumnFilter = (key: string) => {
        setColumnFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setColumnFilters({});
        setCurrentPage(1);
    };

    // Column Management Handlers


    const handleColumnMenuClick = (e: React.MouseEvent, columnKey: string) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === columnKey ? null : columnKey);
        setColumnChooserOpen(false);
    };

    const handleColumnReorder = (sourceKey: string, targetKey: string) => {
        const newOrder = [...columnOrder];
        const sourceIndex = newOrder.indexOf(sourceKey);
        const targetIndex = newOrder.indexOf(targetKey);

        if (sourceIndex !== -1 && targetIndex !== -1) {
            newOrder.splice(sourceIndex, 1);
            newOrder.splice(targetIndex, 0, sourceKey);
            setColumnOrder(newOrder);
        }
    };




    // Close Context Menu on click outside
    useEffect(() => {
        const handleClick = () => {
            setContextMenu({ ...contextMenu, visible: false });
            setDownloadMenuOpen(false);
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [contextMenu]);

    const handleSumColumn = () => {
        if (contextMenu.columnKey) {
            setSumColumns(prev => new Set(prev).add(contextMenu.columnKey!));
        }
    };

    const handleCloseSumRow = () => {
        setSumColumns(new Set());
    };

    const calculateSum = (key: string) => {
        const dataToSum = selectedIds.size > 0
            ? data.filter(item => selectedIds.has(item.id))
            : filteredData;

        return dataToSum.reduce((acc, item) => {
            const value = item[key as keyof T];
            if (typeof value === 'number') return acc + value;
            if (typeof value === 'string') {
                const num = parseFloat(value.replace(/[^0-9.-]+/g, ""));
                return acc + (isNaN(num) ? 0 : num);
            }
            return acc;
        }, 0);
    };

    const formatSum = (sum: number, key: string) => {
        const sample = data[0]?.[key as keyof T];
        if (typeof sample === 'string' && sample.includes('$')) {
            return `$${sum.toLocaleString()}`;
        }
        return sum.toLocaleString();
    };

    const handleCopySum = (sum: number, key: string) => {
        const formatted = formatSum(sum, key);
        navigator.clipboard.writeText(formatted);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 500); // Shorter duration for fast flash
    };

    const handleDownload = (format: 'csv' | 'excel' | 'pdf' | 'json') => {
        setDownloadMenuOpen(false);
        const dataToExport = selectedIds.size > 0
            ? data.filter(item => selectedIds.has(item.id))
            : data;

        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `export-${timestamp}`;

        if (format === 'csv') {
            const headers = columns.map(col => col.label).join(',');
            const rows = dataToExport.map(item =>
                columns.map(col => {
                    const val = item[col.key];
                    return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
                }).join(',')
            ).join('\n');
            const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${fileName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(item => {
                const row: any = {};
                columns.forEach(col => {
                    row[col.label] = item[col.key];
                });
                return row;
            }));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            const tableColumn = columns.map(col => col.label);
            const tableRows = dataToExport.map(item => columns.map(col => {
                const val = item[col.key];
                return String(val); // Ensure string for PDF
            }));

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
            });
            doc.save(`${fileName}.pdf`);
        } else if (format === 'json') {
            const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
            const link = document.createElement("a");
            link.setAttribute("href", jsonContent);
            link.setAttribute("download", `${fileName}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const filteredData = useMemo(() => {
        let result = data;

        // Global Search
        if (enableSearch && searchTerm) {
            result = result.filter((item) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // AutoFilter
        if (enableAutoFilter) {
            Object.entries(columnFilters).forEach(([key, filterValue]) => {
                if (filterValue) {
                    result = result.filter((item) => {
                        const itemValue = String(item[key as keyof T] || "");
                        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
                    });
                }
            });
        }

        // Filter Selected
        if (showSelectedOnly) {
            result = result.filter((item) => selectedIds.has(item.id));
        }

        return result;
    }, [data, searchTerm, enableSearch, columnFilters, enableAutoFilter, showSelectedOnly, selectedIds]);

    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const currentData = enablePagination
        ? sortedData.slice(startIndex, startIndex + entriesPerPage)
        : sortedData;

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div ref={containerRef} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        {enableShowEntries && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
                                    Show
                                </span>
                                <select
                                    value={entriesPerPage}
                                    onChange={(e) => {
                                        setEntriesPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-theme-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                                <span className="text-gray-500 dark:text-gray-400 text-theme-sm">
                                    entries
                                </span>
                            </div>
                        )}
                    </div>
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400 font-medium">
                                {selectedIds.size} of {data.length} row(s) selected
                            </span>
                            <Badge
                                variant="light"
                                color="info"
                                onClick={() => {
                                    setShowSelectedOnly(!showSelectedOnly);
                                    setCurrentPage(1);
                                }}
                            >
                                {showSelectedOnly ? "Show all" : "Filter selected"}
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {enableSearch && (
                        <div className="relative flex-1 md:flex-none">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 dark:border-gray-700 rounded-lg pl-11 pr-14 py-2 text-theme-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 w-full md:w-64 lg:w-80"
                            />
                            {searchTerm && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Badge
                                        variant="light"
                                        color="info"
                                        size="xs"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setCurrentPage(1);
                                        }}
                                    >
                                        Clear
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )}
                    {onAddNew && (
                        addNewButtonLabel ? (
                            <button
                                onClick={onAddNew}
                                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                {addNewButtonLabel}
                            </button>
                        ) : (
                            <button
                                title="Add New"
                                onClick={onAddNew}
                                className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </button>
                        )
                    )}
                    {enableFilter && (
                        <button
                            title="Toggle Filters"
                            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                />
                            </svg>
                        </button>
                    )}
                    {enableDownload && (
                        <div className="relative">
                            <button
                                title="Download"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDownloadMenuOpen(!downloadMenuOpen);
                                }}
                                className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                            </button>
                            {downloadMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-1">
                                    <button
                                        onClick={() => handleDownload('csv')}
                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download CSV
                                    </button>
                                    <button
                                        onClick={() => handleDownload('excel')}
                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Excel
                                    </button>
                                    <button
                                        onClick={() => handleDownload('pdf')}
                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => handleDownload('json')}
                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        Download JSON
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table className="table-fixed">
                    <TableHeader className="border border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
                        <TableRow className="border-b border-gray-200 dark:border-white/[0.05]">
                            {enableSelection && (
                                <TableCell isHeader className="px-3 py-2.5 text-center w-px whitespace-nowrap border-r border-gray-200 dark:border-white/[0.05]">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 w-4 h-4"
                                        onChange={handleSelectAll}
                                        checked={
                                            currentData.length > 0 &&
                                            currentData.every((item) => selectedIds.has(item.id))
                                        }
                                    />
                                </TableCell>
                            )}
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
                                                if (enableColumnMenu) {
                                                    e.preventDefault();
                                                    handleColumnMenuClick(e, String(column.key));
                                                }
                                            }}
                                            className={`relative px-3 py-2.5 font-bold text-gray-700 text-start text-sm dark:text-gray-200 border-r border-gray-200 dark:border-white/[0.05] ${column.sortable
                                                ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                                : ""
                                                } ${isDragging ? "opacity-50" : ""} ${isDropTarget ? "bg-brand-100 dark:bg-brand-900/30 border-l-4 border-l-brand-500" : ""
                                                } cursor-move transition-all duration-200`}
                                            style={{ width, maxWidth: width, minWidth: column.minWidth || 20 }}
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
                                                {(typeof width === 'number' ? width : parseInt(String(width))) < MINIMAL_COLUMN_WIDTH ? (
                                                    // Show only 3 horizontal dots when column is extremely narrow
                                                    <div className="flex items-center justify-center w-full">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                                            <circle cx="3" cy="8" r="1.5" />
                                                            <circle cx="8" cy="8" r="1.5" />
                                                            <circle cx="13" cy="8" r="1.5" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="truncate">{column.label}</span>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {column.sortable && (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <svg
                                                                        className={`w-2.5 h-2.5 ${sortConfig?.key === column.key &&
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
                                                                        className={`w-2.5 h-2.5 ${sortConfig?.key === column.key &&
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
                                                            {enableColumnMenu && (
                                                                <button
                                                                    className="column-dropdown py-1 pl-1 pr-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                                    onClick={(e) => handleColumnMenuClick(e, String(column.key))}
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                                                        <circle cx="8" cy="3" r="1.5" />
                                                                        <circle cx="8" cy="8" r="1.5" />
                                                                        <circle cx="8" cy="13" r="1.5" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
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
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                                        </svg>
                                                        Column Chooser
                                                    </button>
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
                                                    onDoubleClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleRestoreColumnWidth(String(column.key));
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                    );
                                })}
                            {(actionButtons || onEdit || onDelete) && (
                                <TableCell
                                    isHeader
                                    className="px-3 py-2.5 font-bold text-gray-700 text-center text-sm dark:text-gray-200 w-px whitespace-nowrap"
                                >
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                        {enableAutoFilter && (
                            <TableRow>
                                <TableCell className="px-1 py-2 border-r border-gray-200 dark:border-white/[0.05]">
                                    {Object.keys(columnFilters).length > 0 && (
                                        <div className="flex justify-center">
                                            <Badge
                                                variant="light"
                                                color="info"
                                                size="xs"
                                                onClick={clearAllFilters}
                                            >
                                                Clear
                                            </Badge>
                                        </div>
                                    )}
                                </TableCell>
                                {columnOrder
                                    .filter(key => visibleColumns.has(key))
                                    .map((key) => {
                                        const column = columns.find(col => String(col.key) === key);
                                        if (!column) return null;

                                        return (
                                            <TableCell
                                                key={`filter-${String(column.key)}`}
                                                className="px-5 py-2 border-r border-gray-200 dark:border-white/[0.05]"
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={columnFilters[String(column.key)] || ""}
                                                        onChange={(e) =>
                                                            handleColumnFilterChange(
                                                                String(column.key),
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white pr-6"
                                                        placeholder={`Filter ${column.label}...`}
                                                    />
                                                    {columnFilters[String(column.key)] && (
                                                        <button
                                                            onClick={() => clearColumnFilter(String(column.key))}
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                                                        >
                                                            <svg
                                                                className="w-3 h-3"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                {(onEdit || onDelete) && (
                                    <TableCell className="px-3 py-2 border-r border-gray-200 dark:border-white/[0.05]">
                                        {/* Actions column filter cell - empty */}
                                        {null}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {currentData.map((item) => (
                            <TableRow key={item.id} className={`hover:bg-gray-50 dark:hover:bg-white/[0.02] ${selectedIds.has(item.id) ? "bg-gray-100 dark:bg-white/[0.05]" : ""}`}>
                                {enableSelection && (
                                    <TableCell className="px-3 py-4 text-center border-r border-gray-100 dark:border-white/[0.05]">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 w-4 h-4"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => handleSelectRow(item.id)}
                                        />
                                    </TableCell>
                                )}
                                {columnOrder
                                    .filter(key => visibleColumns.has(key))
                                    .map((key) => {
                                        const column = columns.find(col => String(col.key) === key);
                                        if (!column) return null;

                                        const width = columnWidths[String(column.key)] || "auto";
                                        const isMinimal = (typeof width === 'number' ? width : parseInt(String(width))) < MINIMAL_COLUMN_WIDTH;

                                        return (
                                            <TableCell
                                                key={String(column.key)}
                                                className="px-3 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 border-r border-gray-100 dark:border-white/[0.05]"
                                                style={{ width, maxWidth: width, minWidth: column.minWidth || 20 }}
                                            >
                                                {isMinimal ? (
                                                    <div className="flex items-center justify-center">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                                            <circle cx="3" cy="8" r="1.5" />
                                                            <circle cx="8" cy="8" r="1.5" />
                                                            <circle cx="13" cy="8" r="1.5" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="truncate">
                                                        {column.render
                                                            ? column.render(item)
                                                            : (item[column.key] as React.ReactNode)}
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                {(actionButtons || onEdit || onDelete) && (
                                    <TableCell className="px-3 py-4 text-gray-500 text-center text-theme-sm dark:text-gray-400 w-px whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-3">
                                            {actionButtons ? (
                                                // Custom action buttons
                                                actionButtons.map((action, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => action.onClick(item)}
                                                        className={`transition-colors ${action.variant === 'danger'
                                                            ? 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500'
                                                            : 'text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500'
                                                            }`}
                                                        title={action.label}
                                                    >
                                                        {action.icon}
                                                    </button>
                                                ))
                                            ) : (
                                                // Backward compatibility: default Edit/Delete buttons
                                                <>
                                                    {onEdit && showEdit && (
                                                        <button
                                                            onClick={() => onEdit(item)}
                                                            className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500 transition-colors"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {onDelete && showDelete && (
                                                        <button
                                                            onClick={() => onDelete(item)}
                                                            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                    {sumColumns.size > 0 && (
                        <TableBody className="border-2 border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
                            <TableRow>
                                <TableCell className="px-1 py-2.5 border-r border-gray-200 dark:border-white/[0.05]">
                                    <div className="flex justify-center">
                                        <Badge
                                            variant="light"
                                            color="info"
                                            size="xs"
                                            onClick={handleCloseSumRow}
                                        >
                                            Close
                                        </Badge>
                                    </div>
                                </TableCell>
                                {columnOrder.filter(key => visibleColumns.has(key))
                                    .map((key) => {
                                        const column = columns.find(col => String(col.key) === key);
                                        if (!column) return null;

                                        const isSumColumn = sumColumns.has(String(column.key));
                                        const sumValue = isSumColumn ? calculateSum(String(column.key)) : 0;
                                        const isCopied = copiedKey === String(column.key);

                                        return (
                                            <TableCell
                                                key={`sum-${String(column.key)}`}
                                                className="px-5 py-2.5 font-bold text-gray-700 text-start text-sm dark:text-gray-200 border-r border-gray-200 dark:border-white/[0.05]"
                                            >
                                                {isSumColumn ? (
                                                    <div className="flex items-center justify-between gap-2 group w-full">
                                                        <span
                                                            className="transition-opacity"
                                                            style={isCopied ? { animation: 'flash 0.2s ease-in-out 2' } : {}}
                                                        >
                                                            {formatSum(sumValue, String(column.key))}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopySum(sumValue, String(column.key))}
                                                            className="text-gray-400 hover:text-brand-500 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                                            title="Copy to clipboard"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                {(onEdit || onDelete) && (
                                    <TableCell className="px-5 py-4 border-r border-gray-200 dark:border-white/[0.05]">
                                        {null}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableBody>
                    )}
                </Table>
            </div>

            {enablePagination && (
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                    <div className="text-gray-500 dark:text-gray-400 text-theme-sm">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(startIndex + entriesPerPage, sortedData.length)} of{" "}
                        {sortedData.length} entries
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-theme-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
                        >
                            Previous
                        </button>
                        {(() => {
                            const pages = [];
                            const maxVisible = 7; // Number of buttons to show (excluding Prev/Next)

                            if (totalPages <= maxVisible) {
                                // Show all pages if they fit
                                for (let i = 1; i <= totalPages; i++) {
                                    pages.push(i);
                                }
                            } else {
                                // Logic for stable width (always show ~7 items)
                                if (currentPage < 5) {
                                    // Near Start: 1 2 3 4 5 ... Total
                                    pages.push(1, 2, 3, 4, 5, '...', totalPages);
                                } else if (currentPage > totalPages - 4) {
                                    // Near End: 1 ... Total-4 Total-3 Total-2 Total-1 Total
                                    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                } else {
                                    // Middle: 1 ... Current-1 Current Current+1 ... Total
                                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                }
                            }

                            return pages.map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                                    );
                                }

                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page as number)}
                                        className={`px-3 py-1 border rounded text-theme-sm w-8 h-8 flex items-center justify-center ${currentPage === page
                                            ? "bg-brand-500 text-white border-brand-500"
                                            : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            });
                        })()}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-theme-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
            {contextMenu.visible && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 min-w-[150px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        onClick={handleSumColumn}
                    >
                        Sum Column
                    </button>
                </div>
            )}
            {/* Flash Animation Keyframes */}
            <style>
                {`
                    @keyframes flash {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.2; }
                    }
                `}
            </style>

            {/* Column Chooser Modal */}
            {columnChooserOpen && (
                <ColumnChooserModal
                    columns={columns.map(col => ({ key: String(col.key), label: col.label }))}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumnVisibility}
                    onToggleAll={toggleAllColumns}
                    onReset={resetColumns}
                    onClose={() => setColumnChooserOpen(false)}
                    containerRef={containerRef}
                />
            )}


        </div>
    );
}
