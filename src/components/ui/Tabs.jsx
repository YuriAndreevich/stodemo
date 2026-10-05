import { cn } from '../../utils/cn';

export function Tabs({ items = [], value, onChange, className }) {
    return (
        <div className={cn('tabs', className)}>
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    className={cn('tab', value === item.value && 'active')}
                    onClick={() => onChange?.(item.value)}
                >
                    {item.icon ? <span>{item.icon}</span> : null}
                    <span>{item.label}</span>
                    {typeof item.count === 'number' ? (
                        <span className="tab-count">{item.count}</span>
                    ) : null}
                </button>
            ))}
        </div>
    );
}