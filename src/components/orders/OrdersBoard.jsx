// src/components/orders/OrdersBoard.jsx

import { useState, useMemo } from 'react';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useUi } from '../../context/UiContext';
import { Badge, Button, Modal, Select, Textarea, Input, IconButton } from '../ui';
import { cn } from '../../utils/cn';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { OrderFormModal } from './OrderFormModal';
import { OrderPrintView } from './OrderPrintView'; // <-- НОВЫЙ ИМПОРТ
import { PartsSearchModal } from './PartsSearchModal'; // <-- НОВЫЙ ИМПОРТ
import { ScheduleDrawer } from './ScheduleDrawer';

const STATUSES = [
    { id: 'new', label: 'Новые заявки', color: '#22d3ee' },
    { id: 'in_progress', label: 'В работе', color: '#f59e0b' },
    { id: 'waiting_part', label: 'Ждут запчасть', color: '#94a3b8' },
    { id: 'ready', label: 'Готово к выдаче', color: '#22c55e' },
    { id: 'done', label: 'Выдано / Оплачено', color: '#64748b' },
];

export function OrdersBoard() {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast } = useUi();
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    const [draggedOrderId, setDraggedOrderId] = useState(null);
    const [hoveredColumn, setHoveredColumn] = useState(null);
    const [searchingOrderId, setSearchingOrderId] = useState(null); // Для поиска деталей


    // Модалки
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [printingOrder, setPrintingOrder] = useState(null); // Для печати

    const orders = data.orders || [];
    const clients = data.clients || [];
    const vehicles = data.vehicles || [];
    const employees = data.employees || [];

    // Группировка
    const groupedOrders = useMemo(() => {
        const groups = {};
        STATUSES.forEach(s => { groups[s.id] = []; });
        orders.forEach(order => {
            if (groups[order.status]) groups[order.status].push(order);
            else groups['new'].push(order);
        });
        return groups;
    }, [orders]);

    const getClient = (id) => clients.find(c => c.id === id);
    const getVehicle = (id) => vehicles.find(v => v.id === id);
    const getEmployee = (id) => employees.find(e => e.id === id);

    // --- DRAG & DROP ---
    const handleDragStart = (e, orderId) => {
        setDraggedOrderId(orderId);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragEnd = () => {
        setDraggedOrderId(null);
        setHoveredColumn(null);
    };
    const handleDragOver = (e, statusId) => {
        e.preventDefault();
        if (hoveredColumn !== statusId) setHoveredColumn(statusId);
    };
    const handleDrop = (e, targetStatusId) => {
        e.preventDefault();
        if (!draggedOrderId) return;
        const order = orders.find(o => o.id === draggedOrderId);
        if (order && order.status !== targetStatusId) {
            dispatch({ type: 'UPDATE', entity: 'orders', id: draggedOrderId, patch: { status: targetStatusId } });
            addToast({ tone: 'success', title: 'Статус изменен', description: `${order.number} -> ${STATUSES.find(s => s.id === targetStatusId)?.label}` });
        }
        setDraggedOrderId(null);
        setHoveredColumn(null);
    };

    // --- ACTIONS ---
    const openViewDetails = (order) => setViewingOrder(order);
    const closeViewDetails = () => setViewingOrder(null);

    const openPrintPreview = (order) => {
        // Подготовка данных для печати
        const client = getClient(order.clientId);
        const vehicle = getVehicle(order.vehicleId);

        // Формируем объект с именами вместо ID
        const printData = {
            ...order,
            clientName: client?.name || 'Неизвестный',
            clientPhone: client?.phone || '-',
            vehicleMake: vehicle?.make || '-',
            vehicleModel: vehicle?.model || '-',
            vehiclePlate: vehicle?.plate || '-',
            vehicleMileage: vehicle?.mileage || '-',
            laborCost: order.total - (order.usedParts?.reduce((sum, p) => sum + ((data.parts.find(pt => pt.id === p.partId)?.priceSell || 0) * p.quantity), 0) || 0),
            usedParts: order.usedParts?.map(up => {
                const part = data.parts.find(p => p.id === up.partId);
                return {
                    name: part?.name || 'Unknown Part',
                    quantity: up.quantity,
                    price: part?.priceSell || 0,
                    total: (part?.priceSell || 0) * up.quantity
                };
            }) || []
        };

        setPrintingOrder(printData);
    };

    const closePrintPreview = () => setPrintingOrder(null);

    const markAsPaid = (order) => {
        if (order.paid >= order.total) {
            addToast({ tone: 'info', title: 'Уже оплачен' });
            return;
        }

        // Имитация приема полной оплаты
        dispatch({
            type: 'UPDATE',
            entity: 'orders',
            id: order.id,
            patch: {
                paid: order.total,
                status: 'done'
            }
        });

        addToast({ tone: 'success', title: 'Оплата принята', description: `Чек пробит на сумму ${formatMoney(order.total)}` });
    };

    // --- RENDER CARD ---
    const OrderCard = ({ order }) => {
        const client = getClient(order.clientId);
        const vehicle = getVehicle(order.vehicleId);
        const employee = getEmployee(order.employeeId);
        const isFullyPaid = order.paid >= order.total;

        return (
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, order.id)}
                onDragEnd={handleDragEnd}
                onClick={() => openViewDetails(order)}
                style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    opacity: draggedOrderId === order.id ? 0.5 : 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s ease',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{order.number}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{formatMoney(order.total)}</span>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: 15, lineHeight: 1.3 }}>
                    {order.serviceName}
                </h4>

                <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span>👤</span>
                        <strong>{client?.name || '—'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span>🚗</span>
                        <span>{vehicle ? `${vehicle.make} ${vehicle.model}` : 'Авто?'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>👨‍🔧</span>
                        <span style={{ color: employee ? 'var(--success)' : 'var(--danger)' }}>
                            {employee ? employee.name : 'Не назначен'}
                        </span>
                    </div>
                </div>

                {/* Блок действий (виден только при ховере или всегда? Лучше всегда для менеджера) */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 5, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>

                    {/* КНОПКА ПОИСКА ДЕТАЛЕЙ */}
                    <IconButton size="sm" variant="ghost" title="Найти деталь / Проценка" onClick={() => setSearchingOrderId(order.id)}>
                        🔍
                    </IconButton>

                    <IconButton size="sm" variant="ghost" title="Печать" onClick={() => openPrintPreview(order)}>🖨</IconButton>

                    {!isFullyPaid && (
                        <Button size="sm" variant="secondary" onClick={() => markAsPaid(order)}>💳 Оплата</Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="stack">
            {/* Модалка поиска запчастей */}
            {searchingOrderId && (
                <PartsSearchModal
                    isOpen={!!searchingOrderId}
                    onClose={() => setSearchingOrderId(null)}
                    orderId={searchingOrderId}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Поток заказов</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                    {/* НОВАЯ КНОПКА РАСПИСАНИЯ */}
                    <Button
                        variant="secondary"
                        onClick={() => setIsScheduleOpen(true)}
                        title="Посмотреть загрузку постов"
                    >
                        📅 Расписание
                    </Button>

                    <Button onClick={() => setIsCreateModalOpen(true)}>+ Быстрый заказ</Button>
                </div>
            </div>
            {/* Board Container */}
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 20, minHeight: 'calc(100vh - 250px)' }}>
                {STATUSES.map(status => {
                    const items = groupedOrders[status.id] || [];
                    const isHovered = hoveredColumn === status.id;

                    return (
                        <div
                            key={status.id}
                            onDragOver={(e) => handleDragOver(e, status.id)}
                            onDrop={(e) => handleDrop(e, status.id)}
                            style={{
                                minWidth: 320, maxWidth: 360, flexShrink: 0,
                                background: isHovered ? 'rgba(34, 211, 238, 0.05)' : 'var(--surface)',
                                borderRadius: 16,
                                border: `2px solid ${isHovered ? status.color : 'var(--border)'}`,
                                transition: 'all 0.2s ease',
                                display: 'flex', flexDirection: 'column',
                            }}
                        >
                            <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', color: status.color }}>
                                <span>{status.label}</span>
                                <Badge tone="neutral">{items.length}</Badge>
                            </div>
                            <div style={{ padding: 12, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {items.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 13, padding: 20, fontStyle: 'italic' }}>Пусто</div>
                                ) : (
                                    items.map(order => <OrderCard key={order.id} order={order} />)
                                )}
                            </div>
                        </div>

                    );
                })}
            </div>

            {/* Modals */}
            <OrderFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {viewingOrder && (
                <Modal
                    open={!!viewingOrder}
                    onClose={closeViewDetails}
                    title={`Наряд ${viewingOrder.number}`}
                    footer={<Button variant="ghost" onClick={closeViewDetails}>Закрыть</Button>}
                >
                    {/* ... контент просмотра деталей (можно оставить как было ранее) ... */}
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(viewingOrder, null, 2)}</pre>
                </Modal>
            )}

            {printingOrder && (
                <OrderPrintView
                    isOpen={true}
                    onClose={closePrintPreview}
                    order={printingOrder}
                />
            )}
            {/* Модалка расписания */}
            <ScheduleDrawer
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
            />
        </div>
    );
}

export default OrdersBoard;