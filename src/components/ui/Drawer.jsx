import { useEffect } from 'react';
import { IconButton } from './Button';

export function Drawer({
    open,
    onClose,
    title,
    children,
    footer,
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
        <div className="drawer-overlay" onMouseDown={onClose}>
            <div
                className="drawer"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="drawer-head">
                    <h2>{title}</h2>
                    <IconButton variant="ghost" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </IconButton>
                </div>

                <div className="drawer-body">{children}</div>

                {footer ? <div className="drawer-foot">{footer}</div> : null}
            </div>
        </div>
    );
}