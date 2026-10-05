// src/pages/DashboardPage.jsx

import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useUi } from '../context/UiContext';
import { Card, Badge, Button, Avatar, EmptyState } from '../components/ui';
import { formatMoney } from '../utils/format';
import { daysUntil, formatDate } from '../utils/dates';
import { cn } from '../utils/cn';

export function DashboardPage() {
    const data = useData();
    const { setActivePage } = useUi();
    const currency = data.settings?.currency || 'BYN';

    // --- ХЕЛПЕРЫ ДАТ (Нативный JS, без зависимостей) ---

    // Получаем текущую дату в формате YYYY-MM-DD
    const getTodayIso = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Парсим любую дату (строку или объект) в стандартный формат YYYY-MM-DD
    const normalizeDate = (input) => {
        if (!input) return '';
        try {
            const d = new Date(input);
            if (isNaN(d.getTime())) return '';
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } catch (e) {
            return '';
        }
    };

    // Вычисляем дату N дней назад относительно сегодня
    const getDateNDaysAgo = (daysBack) => {
        const d = new Date();
        d.setDate(d.getDate() - daysBack);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // --- АНАЛИТИКА ---
    // --- АНАЛИТИКА ---
    const analytics = useMemo(() => {
        const orders = data.orders || [];
        const payments = data.payments || [];
        const clients = data.clients || [];
        const employees = data.employees || [];
        const parts = data.parts || [];
        const events = data.videoEvents || [];

        const todayStr = getTodayIso();

        // ==========================================
        // 1. ФИНАНСЫ: ВЫРУЧКА И ЗАТРАТЫ
        // ==========================================

        // Общая выручка (все полученные платежи)
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

        // Выручка за сегодня
        const revenueToday = payments.filter(p => normalizeDate(p.date) === todayStr)
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        // Ожидаемая выручка (Pipeline): Сумма активных заказов минус уже оплаченное
        const activeOrders = orders.filter(o => !['done', 'canceled'].includes(o.status));
        const pipelineValue = activeOrders.reduce((sum, o) => sum + (Number(o.total) - Number(o.paid)), 0);

        // Себестоимость проданных товаров (COGS)
        // Считаем только по ВЫПОЛНЕННЫМ заказам, где есть запчасти
        let costOfGoodsSold = 0;
        orders.forEach(order => {
            if (order.status === 'done' && order.usedParts && order.usedParts.length > 0) {
                order.usedParts.forEach(up => {
                    const part = parts.find(p => p.id === up.partId);
                    if (part) {
                        // Закупочная цена * Количество
                        costOfGoodsSold += (Number(part.priceBuy) || 0) * (Number(up.quantity) || 1);
                    }
                });
            }
        });

        // Фонд оплаты труда (ФОТ / Payroll)
        // Считаем комиссионные мастерам за выполненные заказы за ТЕКУЩИЙ МЕСЯЦ
        let totalPayroll = 0;
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        const monthStartStr = `${currentMonthStart.getFullYear()}-${String(currentMonthStart.getMonth() + 1).padStart(2, '0')}-01`;

        orders.forEach(order => {
            if (order.status === 'done' && order.employeeId) {
                const orderDateStr = normalizeDate(order.date);

                // Проверяем, был ли заказ выполнен в текущем месяце
                if (orderDateStr >= monthStartStr && orderDateStr <= todayStr) {
                    const emp = employees.find(e => e.id === order.employeeId);
                    if (emp && emp.commissionRate) {
                        // Комиссия = Стоимость заказа * Ставка мастера
                        const commission = (Number(order.total) || 0) * (Number(emp.commissionRate) || 0);
                        totalPayroll += commission;
                    }
                }
            }
        });

        // Чистая прибыль (Примерная оценка за месяц/период)
        // Формула: Выручка - COGS - ФОТ
        // Примечание: В реальном ERP тут еще вычеты аренды, налогов и т.д., но для демо это ключевой показатель эффективности сервиса
        const netProfit = totalRevenue - costOfGoodsSold - totalPayroll;


        // ==========================================
        // 2. МАСТЕРА (Рейтинг за 7 дней)
        // ==========================================
        const empStats = {};
        employees.forEach(e => {
            empStats[e.id] = { id: e.id, name: e.name, revenue: 0, jobs: 0, earnings: 0 };
        });

        const sevenDaysAgoStr = getDateNDaysAgo(7);

        orders.forEach(order => {
            if (order.status === 'done' && order.employeeId) {
                const orderDateStr = normalizeDate(order.date);

                if (orderDateStr >= sevenDaysAgoStr && orderDateStr <= todayStr) {
                    const empId = order.employeeId;
                    if (empStats[empId]) {
                        empStats[empId].revenue += Number(order.total) || 0;
                        empStats[empId].jobs += 1;

                        // Добавляем расчет заработка конкретного мастера
                        const empData = employees.find(e => e.id === empId);
                        if (empData && empData.commissionRate) {
                            empStats[empId].earnings += (Number(order.total) || 0) * (Number(empData.commissionRate) || 0);
                        }
                    }
                }
            }
        });

        const topEmployees = Object.values(empStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3);


        // ==========================================
        // 3. КЛИЕНТЫ (LTV - Lifetime Value)
        // ==========================================
        const clientStats = {};
        clients.forEach(c => {
            clientStats[c.id] = { id: c.id, name: c.name, phone: c.phone, spent: 0, visits: 0 };
        });

        orders.forEach(order => {
            if (order.status === 'done' && order.clientId) {
                const clId = order.clientId;
                if (clientStats[clId]) {
                    clientStats[clId].spent += Number(order.paid) || 0;
                    clientStats[clId].visits += 1;
                }
            }
        });

        const topClients = Object.values(clientStats)
            .filter(c => c.spent > 0)
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 3);


        // ==========================================
        // 4. ПРОБЛЕМНЫЕ ЗОНЫ (Alerts)
        // ==========================================
        const unassignedOrders = orders.filter(o => !o.employeeId && !['done', 'canceled'].includes(o.status));
        const overdueServices = clients.filter(c => daysUntil(c.nextService) < 0);
        const criticalViolations = events.filter(e => ['high', 'critical'].includes(e.severity) && !e.acknowledged);

        // Низкие остатки на складе
        const lowStockItems = parts.filter(p => p.stock <= p.minStock && p.stock > 0);
        const outOfStockItems = parts.filter(p => p.stock === 0);


        // ==========================================
        // 5. ГРАФИК ВЫРУЧКИ (7 дней)
        // ==========================================
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const targetDateStr = getDateNDaysAgo(i);

            const dayRevenue = payments
                .filter(p => normalizeDate(p.date) === targetDateStr)
                .reduce((sum, p) => sum + Number(p.amount || 0), 0);

            const dObj = new Date(targetDateStr);
            const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

            chartData.push({
                date: targetDateStr,
                label: weekdays[dObj.getDay()],
                value: dayRevenue,
                fullLabel: formatDate(targetDateStr)
            });
        }

        const maxChartValue = Math.max(...chartData.map(d => d.value), 100);

        // ОТЛАДКА
        console.group('📊 Dashboard Debug v2');
        console.log('Total Revenue:', totalRevenue);
        console.log('COGS:', costOfGoodsSold);
        console.log('Payroll:', totalPayroll);
        console.log('Net Profit:', netProfit);
        console.log('Top Employees:', topEmployees);
        console.log('Low Stock Count:', lowStockItems.length);
        console.groupEnd();

        return {
            // Финансы
            totalRevenue,
            revenueToday,
            pipelineValue,
            costOfGoodsSold,   // НОВОЕ
            totalPayroll,      // НОВОЕ
            netProfit,         // НОВОЕ

            // Рейтинги
            topEmployees,
            topClients,

            // Проблемы
            unassignedOrdersCount: unassignedOrders.length,
            overdueServicesCount: overdueServices.length,
            criticalViolationsCount: criticalViolations.length,
            lowStockCount: lowStockItems.length, // НОВОЕ
            outOfStockCount: outOfStockItems.length, // НОВОЕ

            // График
            chartData,
            maxChartValue,
            activeOrdersCount: activeOrders.length
        };
    }, [data]);

    // --- UI КОМПОНЕНТЫ ---

    const MiniBarChart = ({ data, maxValue }) => {
        // Безопасная проверка最大值, чтобы избежать деления на ноль
        const safeMax = Math.max(maxValue, 1);

        return (
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 6,
                height: 100, // Увеличили высоту до 100px для лучшей детализации
                marginTop: 15,
                paddingBottom: 5,
                borderBottom: '1px solid var(--border)'
            }}>
                {data.map((item, idx) => {
                    const isToday = item.date === getTodayIso();

                    // Расчет высоты в процентах (минимум 5%, чтобы было видно даже нулевой день)
                    const rawHeight = (item.value / safeMax) * 100;
                    const heightPercent = Math.max(rawHeight, 5);

                    // Цвета: Сегодня — яркий синий/бирюзовый. Прошлое — серый с прозрачностью.
                    const barColor = isToday
                        ? 'linear-gradient(to top, #0ea5e9, #38bdf8)' // Cyan gradient for today
                        : 'rgba(148, 163, 184, 0.4)'; // Semi-transparent gray for past days

                    const hoverColor = isToday
                        ? 'linear-gradient(to top, #0284c7, #0ea5e9)'
                        : 'rgba(148, 163, 184, 0.6)';

                    return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>

                            {/* Тултип (подсказка при наведении) */}
                            <div style={{
                                position: 'absolute', bottom: '100%', marginBottom: 8, background: '#1e293b', color: '#fff',
                                padding: '6px 10px', borderRadius: 6, fontSize: 12, whiteSpace: 'nowrap', opacity: 0, transition: 'opacity 0.2s ease-out',
                                pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #334155'
                            }} className="chart-tooltip">
                                <strong>{item.fullLabel}</strong><br />
                                <span style={{ color: isToday ? '#38bdf8' : '#cbd5e1' }}>{formatMoney(item.value)}</span>
                            </div>

                            {/* Сам столбик */}
                            <div
                                style={{
                                    width: '100%',
                                    background: barColor,
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: '4px',
                                    height: `${heightPercent}%`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    boxShadow: isToday ? '0 -2px 10px rgba(14, 165, 233, 0.2)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = hoverColor;
                                    const tooltip = e.currentTarget.previousElementSibling;
                                    if (tooltip) tooltip.style.opacity = 1;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = barColor;
                                    const tooltip = e.currentTarget.previousElementSibling;
                                    if (tooltip) tooltip.style.opacity = 0;
                                }}
                            />

                            {/* Подпись дня недели */}
                            <span style={{
                                fontSize: 11,
                                color: isToday ? 'var(--text)' : 'var(--dim)',
                                fontWeight: isToday ? 700 : 500,
                                transform: isToday ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const LeaderRow = ({ rank, name, stat, unit, tone }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{
                    width: 20, height: 20, borderRadius: '50%', background: tone, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700
                }}>
                    {rank}
                </span>
                <strong style={{ fontSize: 13 }}>{name}</strong>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{stat} {unit}</span>
        </div>
    );

    return (
        <div className="stack">

            {/* 1. Верхняя панель KPI */}
            <div className="grid grid-4">
                <Card className="kpi kpi-success">
                    <div className="kpi-top"><span>Выручка (все время)</span><span>💰</span></div>
                    <strong>{formatMoney(analytics.totalRevenue, currency)}</strong>
                    <small>Сегодня: {formatMoney(analytics.revenueToday, currency)}</small>
                </Card>

                <Card className="kpi kpi-accent">
                    <div className="kpi-top"><span>В воронке (ожидается)</span><span>⏳</span></div>
                    <strong>{formatMoney(analytics.pipelineValue, currency)}</strong>
                    <small>Из {analytics.activeOrdersCount} активных заказов</small>
                </Card>

                <Card className={cn('kpi', analytics.unassignedOrdersCount > 0 ? 'kpi-warning' : 'kpi-neutral')}>
                    <div className="kpi-top"><span>Без мастера</span><span>⚠️</span></div>
                    <strong>{analytics.unassignedOrdersCount}</strong>
                    <small>Нужно распределить</small>
                </Card>

                <Card className={cn('kpi', analytics.criticalViolationsCount > 0 ? 'kpi-danger' : 'kpi-neutral')}>
                    <div className="kpi-top"><span>Нарушения ТБ</span><span>🎥</span></div>
                    <strong>{analytics.criticalViolationsCount}</strong>
                    <small>AI-контроль</small>
                </Card>

            </div>
            <div className="grid grid-3" style={{ gap: 16, marginTop: 20 }}>
                <Card className="kpi kpi-success">
                    <div className="kpi-top"><span>Чистая прибыль</span><span>💰</span></div>
                    <strong>{formatMoney(analytics.netProfit, currency)}</strong>
                    <small>Выручка минус затраты</small>
                </Card>

                <Card className="kpi kpi-neutral">
                    <div className="kpi-top"><span>Затраты на запчасти</span><span>📦</span></div>
                    <strong>{formatMoney(analytics.costOfGoodsSold, currency)}</strong>
                    <small>Себестоимость (COGS)</small>
                </Card>

                <Card className="kpi kpi-warning">
                    <div className="kpi-top"><span>Зарплаты мастеров</span><span>👨‍🔧</span></div>
                    <strong>{formatMoney(analytics.totalPayroll, currency)}</strong>
                    <small>Комиссии за месяц</small>
                </Card>
            </div>
            {/* 2. Основной контент */}
            <div className="grid grid-2" style={{ gap: 20 }}>

                {/* Левая колонка */}
                <div className="stack">

                    <Card title="Динамика выручки (7 дней)" subtitle="Наведи на столбик для деталей">
                        <MiniBarChart data={analytics.chartData} maxValue={analytics.maxChartValue} />
                    </Card>

                    <Card title="🏆 Мастера недели" subtitle="По сумме выполненных работ">
                        {analytics.topEmployees.every(e => e.revenue === 0) ? (
                            <EmptyState icon="🔧" title="Нет данных" description="Проверь консоль (F12): возможно, даты заказов вне диапазона 7 дней." />
                        ) : (
                            <div className="stack" style={{ gap: 0 }}>
                                {analytics.topEmployees.map((emp, idx) => (
                                    <LeaderRow
                                        key={emp.id}
                                        rank={idx + 1}
                                        name={emp.name}
                                        stat={formatMoney(emp.revenue, currency)}
                                        unit=""
                                        tone={['#fbbf24', '#94a3b8', '#cd7f32'][idx]}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>

                </div>

                {/* Правая колонка */}
                <div className="stack">

                    <Card title="💎 VIP Клиенты" subtitle="Больше всего потратили у вас">
                        {analytics.topClients.length === 0 ? (
                            <EmptyState icon="👥" title="Нет VIP" description="Добавьте первых постоянных клиентов" />
                        ) : (
                            <div className="stack" style={{ gap: 12 }}>
                                {analytics.topClients.map((client, idx) => (
                                    <div
                                        key={client.id}
                                        onClick={() => setActivePage('clients')}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: 12, background: 'var(--surface-2)', borderRadius: 12, cursor: 'pointer',
                                            border: '1px solid transparent', transition: 'border-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <Avatar name={client.name} size={36} />
                                            <div>
                                                <strong style={{ fontSize: 14, display: 'block' }}>{client.name}</strong>
                                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{client.visits} визитов</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <strong style={{ color: 'var(--success)', fontSize: 15 }}>{formatMoney(client.spent, currency)}</strong>
                                            <div style={{ fontSize: 10, color: 'var(--dim)' }}>LTV</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {(analytics.overdueServicesCount > 0 || analytics.unassignedOrdersCount > 0 || analytics.criticalViolationsCount > 0) && (
                        <Card title="🔥 Требует внимания" variant="danger">
                            <div className="stack" style={{ gap: 10 }}>

                                {analytics.unassignedOrdersCount > 0 && (
                                    <Button fullWidth variant="secondary" onClick={() => setActivePage('orders')}>
                                        ⚡ Назначить мастеров ({analytics.unassignedOrdersCount})
                                    </Button>
                                )}

                                {analytics.overdueServicesCount > 0 && (
                                    <Button fullWidth variant="ghost" onClick={() => setActivePage('reminders')}>
                                        📞 Обзвон просроченных ТО ({analytics.overdueServicesCount})
                                    </Button>
                                )}

                                {analytics.criticalViolationsCount > 0 && (
                                    <Button fullWidth variant="ghost" onClick={() => setActivePage('videoops')}>
                                        🎥 Проверить нарушения ТБ ({analytics.criticalViolationsCount})
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}

                </div>
            </div>
        </div >
    );
}

export default DashboardPage;