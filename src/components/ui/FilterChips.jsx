import { cn } from '../../utils/cn';

export function FilterChips({ items = [], value, onChange, className }) {
    return (
        <div className={cn('chips', className)}>
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    className={cn('chip', value === item.value && 'active')}
                    onClick={() => onChange?.(item.value)}
                >
                    {item.label}
                    {typeof item.count === 'number' ? <span>{item.count}</span> : null}
                </button>
            ))}
        </div>
    );
}