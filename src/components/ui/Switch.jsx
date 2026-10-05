import { cn } from '../../utils/cn';

export function Switch({ label, className, id, ...props }) {
    const inputId = id || props.name;

    return (
        <label className={cn('switch', className)}>
            <input id={inputId} type="checkbox" {...props} />
            {label ? <span>{label}</span> : null}
        </label>
    );
}