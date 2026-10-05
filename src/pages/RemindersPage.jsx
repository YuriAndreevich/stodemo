import { useMemo } from 'react';
import { useData, useDataDispatch } from '../context/DataContext';
import { useUi } from '../context/UiContext';
import {
    Button,
    Card,
    EmptyState,
    PageHeader,
} from '../components/ui';
import {
    addDays,
    daysUntil,
    dueLabel,
    formatDate,
    toISODate,
} from '../utils/dates';

export function RemindersPage() {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast } = useUi();

    const reminders = useMemo(() => {
        return (data.clients || [])
            .filter((client) => daysUntil(client.nextService) <= 14)
            .sort((a, b) => daysUntil(a.nextService) - daysUntil(b.nextService));
    }, [data.clients]);

    const sendReminder = (client) => {
        addToast({
            tone: 'success',
            title: 'Напоминание отправлено',
            description: `Симуляция Telegram/Viber/SMS для: ${client.name}`,
        });
    };

    const postpone = (client) => {
        dispatch({
            type: 'UPDATE',
            entity: 'clients',
            id: client.id,
            patch: {
                nextService: addDays(toISODate(), 180),
            },
        });

        addToast({
            tone: 'success',
            title: 'Визит перенесён',
            description: `${client.name}: следующий визит через 180 дней`,
        });
    };

    return (
        <div className="stack">
            <PageHeader
                title="Напоминания"
                subtitle="Просроченные и ближайшие визиты. Идеально для обзвона и рассылок."
            />

            <Card>
                {reminders.length === 0 ? (
                    <EmptyState
                        icon="✅"
                        title="Срочных напоминаний нет"
                        description="Все клиенты либо уже обслужены, либо визит не скоро"
                    />
                ) : (
                    <div className="stack">
                        {reminders.map((client) => {
                            const diff = daysUntil(client.nextService);
                            const overdue = diff < 0;

                            return (
                                <div
                                    key={client.id}
                                    className={`reminder-card ${overdue ? 'overdue' : ''}`}
                                >
                                    <div>
                                        <strong>{client.name}</strong>
                                        <p>{client.phone}</p>
                                        <small>
                                            {(client.tags || []).join(', ') || 'без тегов'}
                                        </small>
                                    </div>

                                    <div className="reminder-meta">
                                        <span
                                            className={
                                                overdue
                                                    ? 'text-danger'
                                                    : diff <= 7
                                                        ? 'text-warning'
                                                        : 'text-muted'
                                            }
                                        >
                                            {dueLabel(diff)}
                                        </span>
                                        <small>{formatDate(client.nextService)}</small>
                                    </div>

                                    <div className="reminder-actions">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => sendReminder(client)}
                                        >
                                            Напомнить
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={() => postpone(client)}
                                        >
                                            Перенести
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}