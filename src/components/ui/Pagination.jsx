import { Button } from './Button';

export function Pagination({ page, pageCount, onChange }) {
    if (!pageCount || pageCount <= 1) return null;

    return (
        <div className="pagination">
            <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => onChange?.(page - 1)}
            >
                ←
            </Button>

            <span>
                {page} / {pageCount}
            </span>

            <Button
                size="sm"
                variant="ghost"
                disabled={page >= pageCount}
                onClick={() => onChange?.(page + 1)}
            >
                →
            </Button>
        </div>
    );
}