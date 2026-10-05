// src/components/ui/Button.jsx

import { cn } from '../../utils/cn';
import { Spinner } from './Spinner'; // Убедись, что Spinner.jsx существует!

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    type = 'button',
    children,
    ...props
}) {
    return (
        <button
            type={type}
            className={cn('btn', `btn-${variant}`, `btn-${size}`, className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Spinner size="small" /> : null}
            {children}
        </button>
    );
}

export function IconButton({
    variant = 'default',
    size = 'md',
    className,
    type = 'button',
    children,
    ...props
}) {
    return (
        <button
            type={type}
            className={cn(
                'icon-btn',
                variant !== 'default' && `icon-btn-${variant}`,
                size === 'sm' && 'icon-btn-sm',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
