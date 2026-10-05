// src/pages/MarketingPage.jsx

import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useUi } from '../context/UiContext';
import { Card, Badge, Button, Input, Select, EmptyState, Checkbox } from '../components/ui';
import { formatMoney } from '../utils/format';
import { daysUntil, formatDate } from '../utils/dates';

export function MarketingPage() {
    const data = useData();
    const { addToast } = useUi();

    const clients = data.clients || [];

    // Фильтры аудитории
    const [filterType, setFilterType] = useState('overdue'); // overdue, vip, birthday

    const targetAudience = useMemo(() => {
        if (filterType === 'overdue') {
            return clients.filter(c => daysUntil(c.nextService) < 0);
        }
        if (filterType === 'vip') {
            return clients.filter(c => (c.tags || []).includes('VIP'));
        }
        if (filterType === 'birthday') {
            // Имитация: клиенты с ID, оканчивающимся на четное число (для демо)
            return clients.filter(c => parseInt(c.id.replace(/\D/g, '')) % 2 === 0);
        }
        return [];
    }, [clients, filterType]);

    const [messageTemplate, setMessageTemplate] = useState("Здравствуйте, {name}! Пора на ТО.");
    const [channel, setChannel] = useState('telegram');

    const sendCampaign = () => {
        if (targetAudience.length === 0) {
            addToast({ tone: 'warning', title: 'Нет получателей', description: 'Выберите другую аудиторию' });
            return;
        }

        addToast({
            tone: 'success',
            title: 'Рассылка отправлена!',
            description: `${targetAudience.length} сообщений через ${channel}. Статус: Delivered.`
        });

        // Здесь можно было бы сохранить историю рассылок в store
    };

    return (
        <div className="stack">
            <h2>📢 Маркетинг и Возврат клиентов</h2>

            <div className="grid grid-2" style={{ gap: 20 }}>

                {/* Левая колонка: Настройка кампании */}
                <Card title="Новая кампания">
                    <div className="stack" style={{ gap: 15 }}>

                        <Select
                            label="Целевая аудитория"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            options={[
                                { value: 'overdue', label: `Просрочили ТО (${clients.filter(c => daysUntil(c.nextService) < 0).length} чел.)` },
                                { value: 'vip', label: `VIP Клиенты (${clients.filter(c => (c.tags || []).includes('VIP')).length} чел.)` },
                                { value: 'birthday', label: `День рождения (демо)` },
                            ]}
                        />

                        <Select
                            label="Канал связи"
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            options={[
                                { value: 'telegram', label: 'Telegram Bot' },
                                { value: 'viber', label: 'Viber Business' },
                                { value: 'sms', label: 'SMS (платно)' },
                            ]}
                        />

                        <Input
                            label="Шаблон сообщения"
                            value={messageTemplate}
                            onChange={(e) => setMessageTemplate(e.target.value)}
                            placeholder="Текст..."
                        />
                        <small style={{ color: 'var(--muted)' }}>
                            Доступные переменные: {'{name}'}, {'{phone}'}, {'{car_model}'}
                        </small>

                        <Button fullWidth onClick={sendCampaign} disabled={targetAudience.length === 0}>
                            🚀 Отправить ({targetAudience.length} адресатов)
                        </Button>
                    </div>
                </Card>

                {/* Правая колонка: Список получателей */}
                <Card title={`Предпросмотр списка (${targetAudience.length})`} padded={false}>
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {targetAudience.length === 0 ? (
                            <EmptyState icon="👻" title="Никого нет" description="Попробуйте другой фильтр" />
                        ) : (
                            targetAudience.map(client => (
                                <div key={client.id} style={{
                                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <strong>{client.name}</strong>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{client.phone}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <Badge tone={filterType === 'overdue' ? 'danger' : 'info'}>
                                            {filterType === 'overdue' ? 'Просрочено' : filterType === 'vip' ? 'VIP' : 'BDay'}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

            </div>
        </div>
    );
}

export default MarketingPage;