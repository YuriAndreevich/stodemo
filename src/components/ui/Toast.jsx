// src/components/ui/Toast.jsx

import { useUi } from '../../context/UiContext';
import { cn } from '../../utils/cn';

export function ToastHost() {
    const { toasts, dismissToast } = useUi();

    if (!toasts || toasts.length === 0) {
        return null;
    }

    return (
        <div className="toast-host">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn('toast', `toast-${toast.tone || 'info'}`)}
                >
                    <div>
                        <strong>{toast.title}</strong>
                        {toast.description ? <p>{toast.description}</p> : null}
                    </div>

                    <button
                        type="button"
                        onClick={() => dismissToast(toast.id)}
                        aria-label="Закрыть уведомление"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

// На всякий случай добавляем default export, если где-то импортируют так
export default ToastHost;