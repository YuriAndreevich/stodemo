import { cn } from '../../utils/cn';

export function Textarea({
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

            <textarea
                id={inputId}
                className={cn('textarea', error && 'input-error', className)}
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