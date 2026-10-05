// src/components/orders/ScheduleDrawer.jsx

import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Drawer, Badge, Button, Card, EmptyState } from '../ui';
import { formatDate, toISODate, addDays } from '../../utils/dates';
import { cn } from '../../utils/cn';

export function ScheduleDrawer({ isOpen, onClose }) {
    const data = useData();

    // Текущая дата для просмотра (можно менять стрелками)
    const [viewDate, setViewDate] = useState(toISODate());

    // Список постов (имитация ресурсов). В реальном проекте берется из settings.employees где role='mechanic' или отдельной сущности posts
    const POSTS = ['Пост 1', 'Пост 2', 'Пост 3'];

    // Часы работы сервиса
    const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    const orders = data.orders || [];
    const clients = data.clients || [];

    // Фильтруем заказы только за выбранную дату
    const dayOrders = useMemo(() => {
        return orders.filter(o => o.date === viewDate);
    }, [orders, viewDate]);

    // Логика распределения заказов по постам и часам
    // Для демо мы используем простую эвристику:
    // Каждый заказ занимает один пост и начинает работу в первый доступный час после 9 утра.
    // В реальности тут была бы сложная логика длительности (duration).
    const scheduleMap = useMemo(() => {
        const map = {}; // { postId-hourIndex: order }

        let postCounters = { 'Пост 1': 0, 'Пост 2': 0, 'Пост 3': 0 }; // Индекс следующего свободного часа для каждого поста

        // Сортируем заказы по времени поступления (ID или дате создания), чтобы заполнить равномерно
        const sortedOrders = [...dayOrders].sort((a, b) => a.id.localeCompare(b.id));

        sortedOrders.forEach(order => {
            // Находим пост с наименьшей загрузкой
            const availablePosts = Object.keys(postCounters);
            // Простая ротация: Пост 1 -> Пост 2 -> Пост 3 -> Пост 1...
            // Более умно: найти пост, где counter < length(HOURS)

            let assignedPost = null;
            for (const p of availablePosts) {
                if (postCounters[p] < HOURS.length) {
                    assignedPost = p;
                    break;
                }
            }

            if (assignedPost) {
                const hourIdx = postCounters[assignedPost];
                map[`${assignedPost}-${hourIdx}`] = order;
                postCounters[assignedPost]++;
            }
        });

        return map;
    }, [dayOrders, HOURS]);

    const changeDate = (days) => {
        const d = new Date(viewDate);
        d.setDate(d.getDate() + days);
        setViewDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    };

    const getClientName = (id) => clients.find(c => c.id === id)?.name || 'Неизвестный';

    return (
        <Drawer open={isOpen} onClose={onClose} title="📅 Загрузка постов" width="lg">
            <div className="stack" style={{ gap: 20 }}>

                {/* Навигация по датам */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: 10, borderRadius: 8 }}>
                    <Button size="sm" variant="ghost" onClick={() => changeDate(-1)}>←</Button>
                    <strong>{formatDate(viewDate)}</strong>
                    <Button size="sm" variant="ghost" onClick={() => changeDate(1)}>→</Button>
                </div>

                {/* Статистика дня */}
                <div className="grid grid-3" style={{ gap: 10 }}>
                    <Card padded={false}><div style={{ padding: 10, textAlign: 'center' }}><small>Всего заказов</small><br /><strong>{dayOrders.length}</strong></div></Card>
                    <Card padded={false}><div style={{ padding: 10, textAlign: 'center' }}><small>Занято постов</small><br /><strong>{Object.values(scheduleMap).length ? POSTS.length : 0}/3</strong></div></Card>
                    <Card padded={false}><div style={{ padding: 10, textAlign: 'center' }}><small>Свободно</small><br /><strong style={{ color: 'var(--success)' }}>{HOURS.length * POSTS.length - Object.keys(scheduleMap).length} слотов</strong></div></Card>
                </div>

                {/* Таблица расписания */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                <th style={{ padding: 8, borderBottom: '2px solid var(--border)', textAlign: 'left', background: 'var(--surface-2)' }}>Время</th>
                                {POSTS.map(post => (
                                    <th key={post} style={{ padding: 8, borderBottom: '2px solid var(--border)', textAlign: 'center', background: 'var(--surface-2)' }}>
                                        {post}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map(hour => {
                                const hourIdx = HOURS.indexOf(hour);
                                return (
                                    <tr key={hour}>
                                        <td style={{ padding: 8, borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--muted)' }}>{hour}</td>
                                        {POSTS.map(post => {
                                            const key = `${post}-${hourIdx}`;
                                            const order = scheduleMap[key];

                                            return (
                                                <td
                                                    key={key}
                                                    style={{
                                                        padding: 4,
                                                        borderBottom: '1px solid var(--border)',
                                                        background: order ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                                                        cursor: order ? 'default' : 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onClick={() => !order && alert(`Слот ${hour} (${post}) свободен. Можно создать запись.`)}
                                                >
                                                    {order ? (
                                                        <div style={{
                                                            padding: 4,
                                                            background: 'var(--primary)',
                                                            color: '#fff',
                                                            borderRadius: 4,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            <strong>{getClientName(order.clientId).split(' ')[0]}</strong>
                                                            <div style={{ fontSize: 10, opacity: 0.8 }}>{order.serviceName.substring(0, 10)}...</div>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--dim)' }}>—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                    * Демо-режим: заказы распределяются автоматически. В реальной версии используется алгоритм учета длительности работ.
                </p>

            </div>
        </Drawer>
    );
}