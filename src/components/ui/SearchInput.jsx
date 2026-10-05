// src/components/ui/SearchInput.jsx
import { cn } from '../../utils/cn';

export function SearchInput({
    value,
    onChange,
    placeholder = 'Поиск...',
    className,
    ...props
}) {
    return (
        <div className={cn('search-input', className)}>
            <span className="search-icon">🔎</span>

            <input
                className="input"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                {...props}
            />

            {value ? (
                <button
                    type="button"
                    className="search-clear"
                    onClick={() => onChange?.('')}
                    aria-label="Очистить"
                >
                    ✕
                </button>
            ) : null}
        </div>
    );
}

export default SearchInput;