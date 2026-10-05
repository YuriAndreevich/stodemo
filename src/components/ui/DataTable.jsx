import { cn } from '../../utils/cn';
import { Checkbox } from './Checkbox';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export function DataTable({
    columns = [],
    rows = [],
    rowKey = 'id',
    loading = false,
    empty,
    selectable = false,
    selectedIds = [],
    onSelectChange,
    sortConfig,
    onSortChange,
    onRowClick,
    className,
}) {
    const colCount = columns.length + (selectable ? 1 : 0);

    const allSelected =
        selectable &&
        rows.length > 0 &&
        rows.every((row) => selectedIds.includes(row[rowKey]));

    const toggleAll = () => {
        onSelectChange?.(allSelected ? [] : rows.map((row) => row[rowKey]));
    };

    const toggleRow = (id) => {
        onSelectChange?.(
            selectedIds.includes(id)
                ? selectedIds.filter((item) => item !== id)
                : [...selectedIds, id]
        );
    };

    const handleSort = (col) => {
        if (!col.sortable || !onSortChange) return;

        const direction =
            sortConfig?.key === col.key && sortConfig.direction === 'asc'
                ? 'desc'
                : 'asc';

        onSortChange({ key: col.key, direction });
    };

    return (
        <div className="table-wrap">
            <table className={cn('data-table', className)}>
                <thead>
                    <tr>
                        {selectable ? (
                            <th className="col-check">
                                <Checkbox
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    aria-label="Выбрать все"
                                />
                            </th>
                        ) : null}

                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={{ width: col.width }}
                                className={cn(
                                    col.align && `text-${col.align}`,
                                    col.sortable && 'sortable'
                                )}
                                onClick={() => handleSort(col)}
                            >
                                {col.header}
                                {sortConfig?.key === col.key ? (
                                    <span className="sort-arrow">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                                ) : null}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <tr key={index}>
                                <td colSpan={colCount}>
                                    <Skeleton height={22} />
                                </td>
                            </tr>
                        ))
                    ) : rows.length === 0 ? (
                        <tr>
                            <td colSpan={colCount}>
                                {empty ?? (
                                    <EmptyState
                                        title="Нет данных"
                                        description="Измените фильтры или добавьте запись"
                                    />
                                )}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => {
                            const id = row[rowKey];
                            const selected = selectedIds.includes(id);

                            return (
                                <tr
                                    key={id}
                                    className={cn(
                                        selected && 'selected',
                                        onRowClick && 'clickable'
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {selectable ? (
                                        <td
                                            className="col-check"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            <Checkbox
                                                checked={selected}
                                                onChange={() => toggleRow(id)}
                                                aria-label={`Выбрать ${id}`}
                                            />
                                        </td>
                                    ) : null}

                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn(
                                                col.align && `text-${col.align}`,
                                                col.cellClassName
                                            )}
                                        >
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}