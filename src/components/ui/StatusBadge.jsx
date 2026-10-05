import { Badge } from './Badge';

const STATUS_MAP = {
    new: { label: 'Новый', tone: 'info' },
    scheduled: { label: 'Запланирован', tone: 'info' },
    confirmed: { label: 'Подтверждён', tone: 'success' },
    in_progress: { label: 'В работе', tone: 'warning' },
    waiting_part: { label: 'Ждёт запчасть', tone: 'neutral' },
    ready: { label: 'Готов', tone: 'success' },
    done: { label: 'Выполнен', tone: 'success' },
    canceled: { label: 'Отменён', tone: 'danger' },
    sent: { label: 'Отправлено', tone: 'info' },
    queued: { label: 'В очереди', tone: 'neutral' },
    failed: { label: 'Ошибка', tone: 'danger' },
    active: { label: 'Активен', tone: 'success' },
    archived: { label: 'Архив', tone: 'neutral' },
};

export function StatusBadge({ status }) {
    const config = STATUS_MAP[status] || { label: status || '—', tone: 'neutral' };

    return <Badge tone={config.tone}>{config.label}</Badge>;
}