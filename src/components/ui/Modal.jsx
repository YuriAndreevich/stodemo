import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from './Button';

export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div
                className={cn('modal', `modal-${size}`)}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2>{title}</h2>
                    <IconButton variant="ghost" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </IconButton>
                </div>

                <div className="modal-body">{children}</div>

                {footer ? <div className="modal-foot">{footer}</div> : null}
            </div>
        </div>
    );
}