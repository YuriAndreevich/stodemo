// src/components/clients/ClientDetailsDrawer.jsx

import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Drawer, Badge, Button, Avatar, EmptyState, Card } from '../ui';
// Если UI компоненты ломаются, используй прямые пути:
// import { Drawer } from '../ui/Drawer';
// import { Badge } from '../ui/Badge';
// import { Button } from '../ui/Button';
// import { Avatar } from '../ui/Avatar';
// import { EmptyState } from '../ui/EmptyState';
// import { Card } from '../ui/Card';

import { formatDate, daysUntil, dueLabel } from '../../utils/dates';
import { formatMoney } from '../../utils/format';
import { cn } from '../../utils/cn';

export function ClientDetailsDrawer({ isOpen, onClose, clientId }) {
    const data = useData();
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    const client = useMemo(() => {
        if (!clientId) return null;
        return data.clients.find((c) => c.id === clientId);
    }, [data.clients, clientId]);

    // Находим все машины этого клиента
    const vehicles = useMemo(() => {
        if (!client) return [];
        return data.vehicles.filter((v) => v.clientId === client.id);
    }, [data.vehicles, client]);

    // Если выбран автомобиль, находим его историю заказов
    const selectedVehicle = useMemo(() => {
        if (!selectedVehicleId) return null;
        return vehicles.find(v => v.id === selectedVehicleId);
    }, [vehicles, selectedVehicleId]);

    const vehicleHistory = useMemo(() => {
        if (!selectedVehicleId) return [];
        return data.orders
            .filter(o => o.vehicleId === selectedVehicleId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [data.orders, selectedVehicleId]);

    // Общая статистика по всем машинам клиента
    const totalSpent = useMemo(() => {
        const allClientOrders = data.orders.filter(o => o.clientId === clientId);
        return allClientOrders.reduce((sum, o) => sum + (Number(o.paid) || 0), 0);
    }, [data.orders, clientId]);

    if (!isOpen || !client) return null;

    return (
        <Drawer open={isOpen} onClose={onClose} title="Профиль клиента">
            <div className="stack" style={{ gap: 20 }}>

                {/* Шапка */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Avatar name={client.name} size={56} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20 }}>{client.name}</h2>
                        <p style={{ color: 'var(--muted)', margin: '4px 0' }}>{client.phone}</p>
                        <div className="tag-list">
                            {(client.tags || []).map(tag => (
                                <Badge key={tag} tone={tag === 'VIP' ? 'warning' : 'neutral'}>{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Финансы */}
                <Card padded={false}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                        <small style={{ color: 'var(--muted)' }}>Всего оплачено</small>
                        <strong style={{ display: 'block', fontSize: 24, marginTop: 4, color: 'var(--success)' }}>
                            {formatMoney(totalSpent)}
                        </strong>
                    </div>
                </Card>

                {/* Список автомобилей */}
                <div>
                    <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Гараж клиента ({vehicles.length})</span>
                        <Button size="sm" variant="ghost" onClick={() => alert('+ Добавить авто')}>+ Авто</Button>
                    </h3>

                    {vehicles.length === 0 ? (
                        <EmptyState icon="🚗" title="Нет автомобилей" description="Добавьте первое авто клиента" />
                    ) : (
                        <div className="stack" style={{ gap: 10 }}>
                            {vehicles.map(vehicle => {
                                const isActive = selectedVehicleId === vehicle.id;
                                const diff = daysUntil(vehicle.lastServiceDate); // Пример расчета

                                return (
                                    <div
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicleId(isActive ? null : vehicle.id)}
                                        style={{
                                            padding: 12,
                                            borderRadius: 12,
                                            border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                                            background: isActive ? 'rgba(34, 211, 238, 0.05)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: 16 }}>{vehicle.make} {vehicle.model}</strong>
                                                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                                                    {vehicle.plate} • {vehicle.year} г.в. • Пробег: {vehicle.mileage.toLocaleString()} км
                                                </div>
                                            </div>
                                            <Badge tone={diff < 0 ? 'danger' : 'info'}>
                                                {diff < 0 ? 'Просрочено' : 'Актуально'}
                                            </Badge>
                                        </div>

                                        {/* Раскрывающаяся часть с историей, если активна */}
                                        {isActive && (
                                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                                                <h4 style={{ fontSize: 14, margin: '0 0 8px', color: 'var(--text)' }}>История обслуживания:</h4>

                                                {vehicleHistory.length === 0 ? (
                                                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>Заказов еще не было.</p>
                                                ) : (
                                                    <div className="stack" style={{ gap: 8 }}>
                                                        {vehicleHistory.slice(0, 3).map(order => (
                                                            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                                <span>{formatDate(order.date)}</span>
                                                                <span style={{ flex: 1, marginLeft: 10, marginRight: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {order.serviceName}
                                                                </span>
                                                                <span style={{ fontWeight: 700 }}>{formatMoney(order.total)}</span>
                                                            </div>
                                                        ))}
                                                        {vehicleHistory.length > 3 && (
                                                            <button className="link" style={{ fontSize: 12, alignSelf: 'flex-start' }}>
                                                                Показать все ({vehicleHistory.length})
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Быстрые действия внизу */}
                <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <Button fullWidth variant="primary" onClick={() => alert('Новый заказ для ' + client.name)}>
                        Создать новый заказ
                    </Button>
                </div>

            </div>
        </Drawer>
    );
}

export default ClientDetailsDrawer;