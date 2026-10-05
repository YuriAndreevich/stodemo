import { cn } from '../../utils/cn';

export function Input({
    label,
    error,
    hint,
    className,
    id,
    ...props
}) {
    const inputId = id || props.name;

    return (
        <label className="field">
            {label ? <span className="field-label">{label}</span> : null}

            <input
                id={inputId}
                className={cn('input', error && 'input-error', className)}
                {...props}
            />

            {error ? (
                <span className="field-error">{error}</span>
            ) : hint ? (
                <span className="field-hint">{hint}</span>
            ) : null}
        </label>
    );
}