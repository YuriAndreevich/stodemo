// src/components/ui/ConfirmDialog.jsx

import { useUi } from '../../context/UiContext';
import { Button } from './Button'; // Или прямой импорт из ../ui/Button
import { Modal } from './Modal';   // Или прямой импорт из ../ui/Modal

export function ConfirmDialog() {
    const { confirmState, handleConfirmResult } = useUi();

    const {
        title = 'Подтверждение',
        description,
        confirmText = 'Подтвердить',
        cancelText = 'Отмена',
        tone = 'danger',
    } = confirmState.options || {};

    return (
        <Modal
            open={confirmState.open}
            onClose={() => handleConfirmResult(false)}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={() => handleConfirmResult(false)}>
                        {cancelText}
                    </Button>

                    <Button
                        variant={tone === 'danger' ? 'danger' : 'primary'}
                        onClick={() => handleConfirmResult(true)}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <p style={{ margin: 0, color: 'var(--muted)' }}>{description}</p>
        </Modal>
    );
}

export default ConfirmDialog;