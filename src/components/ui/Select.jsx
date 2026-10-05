import { cn } from '../../utils/cn';

export function Select({
    label,
    error,
    hint,
    options = [],
    className,
    children,
    id,
    ...props
}) {
    const selectId = id || props.name;

    const normalizedOptions = options.map((option) =>
        typeof option === 'string' ? { value: option, label: option } : option
    );

    return (
        <label className="field">
            {label ? <span className="field-label">{label}</span> : null}

            <select
                id={selectId}
                className={cn('select', error && 'input-error', className)}
                {...props}
            >
                {children ??
                    normalizedOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
            </select>

            {error ? (
                <span className="field-error">{error}</span>
            ) : hint ? (
                <span className="field-hint">{hint}</span>
            ) : null}
        </label>
    );
}