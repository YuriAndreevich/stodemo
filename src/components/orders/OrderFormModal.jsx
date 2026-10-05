// src/components/orders/OrderFormModal.jsx

import { useState, useMemo, useEffect } from 'react';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useUi } from '../../context/UiContext';
import { Modal, Button, Select, Input, Badge, Card, Checkbox, Textarea, SearchInput } from '../ui';
import { formatMoney } from '../../utils/format';
import { uid } from '../../utils/id';
import { toISODate } from '../../utils/dates';
import { cn } from '../../utils/cn';

export function OrderFormModal({ isOpen, onClose, initialClientId = null }) {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast } = useUi();

    const currency = data.settings?.currency || 'BYN';

    const [formData, setFormData] = useState({
        clientId: initialClientId || '',
        vehicleId: '',
        vin: '',
        serviceIds: [],
        notes: '',
        usedParts: [],
        inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok', photos: [] }
    });

    const [serviceSearch, setServiceSearch] = useState('');
    const [partSearch, setPartSearch] = useState('');

    // Синхронизация при открытии
    useEffect(() => {
        if (isOpen && initialClientId) {
            const firstVehicle = data.vehicles.find(v => v.clientId === initialClientId);
            setFormData(prev => ({
                ...prev,
                clientId: initialClientId,
                vehicleId: firstVehicle ? firstVehicle.id : '',
                vin: firstVehicle ? firstVehicle.vin : ''
            }));
        } else if (isOpen) {
            setFormData({
                clientId: '', vehicleId: '', vin: '', serviceIds: [], notes: '', usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok', photos: [] }
            });
        }
    }, [isOpen, initialClientId, data.vehicles]);

    // --- ЛОГИКА ПОИСКА ЗАПЧАСТЕЙ С УЧЕТОМ АВТО ---
    const suggestedParts = useMemo(() => {
        if (!partSearch.trim() || !formData.vehicleId) return [];

        const currentVehicle = data.vehicles.find(v => v.id === formData.vehicleId);
        const carClass = currentVehicle?.carClass || 'unknown';
        const q = partSearch.toLowerCase();

        let results = [];

        // 1. Поиск по своим остаткам
        const localMatches = data.parts.filter(p => {
            const matchesText = p.name.toLowerCase().includes(q) || p.article.toLowerCase().includes(q);
            // Фильтр по совместимости: если есть поле fitsCarClasses, проверяем его
            const isCompatible = !p.fitsCarClasses ||
                p.fitsCarClasses.includes('all') ||
                p.fitsCarClasses.includes(carClass);

            return matchesText && isCompatible;
        }).map(p => ({
            type: 'local',
            id: p.id,
            name: p.name,
            article: p.article,
            price: p.priceSell,
            stock: p.stock,
            available: p.stock > 0,
            badge: p.stock > 0 ? 'В НАЛИЧИИ' : 'НЕТ',
            color: p.stock > 0 ? 'success' : 'danger'
        }));

        // 2. Поиск по поставщикам (только если локальных мало или нет)
        // Берем артикулы из найденных локальных или ищем напрямую по тексту
        const externalMatches = (data.suppliersOffers || []).filter(o => {
            // Проверяем, подходит ли артикул нашему авто (через маппинг части)
            const relatedPart = data.parts.find(p => p.article === o.partArticle);
            const isCompatible = !relatedPart?.fitsCarClasses ||
                relatedPart.fitsCarClasses.includes('all') ||
                relatedPart.fitsCarClasses.includes(carClass);

            const matchesText = o.partArticle.toLowerCase().includes(q) ||
                o.supplierName.toLowerCase().includes(q) ||
                (relatedPart && relatedPart.name.toLowerCase().includes(q));

            return matchesText && isCompatible;
        }).map(o => {
            const relatedPart = data.parts.find(p => p.article === o.partArticle);
            return {
                type: 'external',
                id: o.id,
                name: relatedPart ? relatedPart.name : `Запчасть ${o.partArticle}`,
                article: o.partArticle,
                price: o.price,
                delivery: `${o.deliveryDays} дн.`,
                supplier: o.supplierName,
                rating: o.rating,
                inStock: o.inStock,
                available: o.inStock, // Можно заказать только если есть у поставщика
                badge: o.inStock ? 'ЗАКАЗАТЬ' : 'ПОДОЖДАТЬ',
                color: o.inStock ? 'info' : 'warning',
                hint: o.deliveryDays === 0 ? 'Сегодня!' : (o.price < (relatedPart?.priceSell || 9999) ? 'Выгоднее склада' : '')
            };
        });

        return [...localMatches, ...externalMatches].slice(0, 8); // Топ-8
    }, [partSearch, formData.vehicleId, data.parts, data.suppliersOffers, data.vehicles]);


    // --- РАСЧЕТ СТОИМОСТИ ---
    const calculation = useMemo(() => {
        let laborCost = 0;
        let partsCost = 0;
        let totalDuration = 0;

        formData.serviceIds.forEach(sid => {
            const svc = data.services.find(s => s.id === sid);
            if (svc) {
                laborCost += Number(svc.price) || 0;
                totalDuration += Number(svc.duration) || 0;
            }
        });

        formData.usedParts.forEach(up => {
            const part = data.parts.find(p => p.id === up.partId);
            if (part) {
                partsCost += (Number(part.priceSell) || 0) * (Number(up.quantity) || 1);
            }
        });

        return { laborCost, partsCost, total: laborCost + partsCost, duration: totalDuration };
    }, [formData.serviceIds, formData.usedParts, data.services, data.parts]);

    // --- ДЕЙСТВИЯ ---

    const handleSelectClient = (clientId) => {
        const vehicles = data.vehicles.filter(v => v.clientId === clientId);
        const firstVeh = vehicles[0];
        setFormData(prev => ({
            ...prev, clientId, vehicleId: firstVeh ? firstVeh.id : '', vin: firstVeh ? firstVeh.vin : '',
            serviceIds: [], usedParts: []
        }));
    };

    const handleSelectVehicle = (vehicleId) => {
        const veh = data.vehicles.find(v => v.id === vehicleId);
        setFormData(prev => ({
            ...prev, vehicleId, vin: veh ? veh.vin : '', serviceIds: [], usedParts: []
        }));
    };

    const toggleService = (sid) => {
        setFormData(prev => {
            const exists = prev.serviceIds.includes(sid);
            return { ...prev, serviceIds: exists ? prev.serviceIds.filter(id => id !== sid) : [...prev.serviceIds, sid] };
        });
    };

    const addPartToOrder = (partItem) => {
        if (partItem.type === 'external') {
            // Имитация заказа у поставщика
            addToast({
                tone: 'info',
                title: 'Заявка создана',
                description: `${partItem.name} • ${partItem.supplier} • Доставка: ${partItem.delivery}`
            });
            // Опционально: менять статус заказа на waiting_part
            return;
        }

        // Локальная деталь
        setFormData(prev => {
            const existingIndex = prev.usedParts.findIndex(p => p.partId === partItem.id);
            if (existingIndex >= 0) {
                const newParts = [...prev.usedParts];
                newParts[existingIndex].quantity += 1;
                return { ...prev, usedParts: newParts };
            }
            return { ...prev, usedParts: [...prev.usedParts, { partId: partItem.id, quantity: 1 }] };
        });
        setPartSearch('');
    };

    const removePart = (index) => {
        setFormData(prev => ({ ...prev, usedParts: prev.usedParts.filter((_, i) => i !== index) }));
    };

    const updateQuantity = (index, val) => {
        setFormData(prev => {
            const newParts = [...prev.usedParts];
            newParts[index].quantity = Math.max(1, parseInt(val) || 1);
            return { ...prev, usedParts: newParts };
        });
    };

    const saveOrder = () => {
        if (!formData.clientId || !formData.vehicleId || formData.serviceIds.length === 0) {
            addToast({ tone: 'danger', title: 'Ошибка', description: 'Выберите клиента, авто и услугу' });
            return;
        }

        const primaryService = data.services.find(s => s.id === formData.serviceIds[0]);

        const newOrder = {
            id: uid(),
            number: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            clientId: formData.clientId,
            vehicleId: formData.vehicleId,
            serviceId: primaryService.id,
            serviceName: primaryService.name,
            additionalServices: formData.serviceIds.slice(1).map(sid => data.services.find(s => s.id === sid)?.name).filter(Boolean),
            employeeId: primaryService.employeeId,
            status: 'new',
            total: calculation.total,
            paid: 0,
            date: toISODate(),
            notes: formData.notes,
            usedParts: formData.usedParts.filter(p => p.partId),
            inspection: formData.inspection,
            vin: formData.vin
        };

        dispatch({ type: 'ADD', entity: 'orders', item: newOrder });
        addToast({ tone: 'success', title: 'Наряд создан', description: `${newOrder.number} • ${formatMoney(calculation.total, currency)}` });
        onClose();
    };

    const clients = data.clients || [];
    const vehiclesForClient = data.vehicles.filter(v => v.clientId === formData.clientId);

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title="Новый Заказ-Наряд"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                    <Button
                        onClick={saveOrder}
                        disabled={!formData.clientId || !formData.vehicleId || formData.serviceIds.length === 0}
                    >
                        Создать наряд ({formatMoney(calculation.total, currency)})
                    </Button>
                </>
            }
        >
            <div className="stack" style={{ gap: 20 }}>

                {/* 1. Идентификация ТС */}
                <Card padded={false}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>Автомобиль и Клиент</h4>
                    </div>
                    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <Select
                            label="Клиент *"
                            value={formData.clientId}
                            onChange={(e) => handleSelectClient(e.target.value)}
                            options={[{ value: '', label: 'Выберите' }, ...clients.map(c => ({ value: c.id, label: `${c.name}` }))]}
                        />

                        <Select
                            label="Авто *"
                            value={formData.vehicleId}
                            onChange={(e) => handleSelectVehicle(e.target.value)}
                            disabled={!formData.clientId}
                            options={[{ value: '', label: '—' }, ...vehiclesForClient.map(v => ({ value: v.id, label: `${v.make} ${v.model}` }))]}
                        />
                    </div>

                    {formData.vin && (
                        <div style={{ padding: '0 16px 16px', background: 'var(--surface-2)', borderRadius: '0 0 12px 12px', marginTop: -16 }}>
                            <small style={{ color: 'var(--muted)' }}>VIN: </small>
                            <strong style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{formData.vin}</strong>
                            <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--primary)' }}>✓ Совместимость проверена</span>
                        </div>
                    )}
                </Card>

                {/* 2. Работы */}
                <Card padded={false}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>Работы и услуги *</h4>
                    </div>

                    <div style={{ padding: 16 }}>
                        <SearchInput
                            placeholder="Поиск услуги..."
                            value={serviceSearch}
                            onChange={setServiceSearch}
                        />

                        <div style={{ maxHeight: 150, overflowY: 'auto', marginTop: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
                            {data.services.filter(s => s.active && (s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || !serviceSearch)).map(svc => (
                                <div key={svc.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 12px', borderBottom: '1px solid var(--surface-2)', cursor: 'pointer',
                                    background: formData.serviceIds.includes(svc.id) ? 'rgba(34, 211, 238, 0.1)' : 'transparent'
                                }} onClick={() => toggleService(svc.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="checkbox" checked={formData.serviceIds.includes(svc.id)} readOnly style={{ pointerEvents: 'none' }} />
                                        <span>{svc.name}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <strong>{formatMoney(svc.price, currency)}</strong>
                                        <div style={{ fontSize: 10, color: 'var(--dim)' }}>{svc.duration} мин</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* 3. Запчасти (Улучшенный UI) */}
                <Card padded={false}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: 14 }}>Подбор запчастей</h4>
                        <small style={{ color: 'var(--muted)' }}>Система автоматически отсекает детали, не подходящие вашему авто ({vehiclesForClient.find(v => v.id === formData.vehicleId)?.make})</small>
                    </div>

                    <div style={{ padding: 16 }}>
                        <SearchInput
                            placeholder="Введите название или артикул (напр. TRW, Колодки)"
                            value={partSearch}
                            onChange={setPartSearch}
                        />

                        {/* Результаты поиска */}
                        {partSearch && suggestedParts.length > 0 && (
                            <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>

                                {/* Секция: Свои остатки */}
                                {suggestedParts.some(p => p.type === 'local') && (
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 8, textTransform: 'uppercase' }}>
                                            📦 На складе сервиса
                                        </div>
                                        {suggestedParts.filter(p => p.type === 'local').map(sp => (
                                            <div key={`loc-${sp.id}`} style={{
                                                padding: 12, background: 'var(--bg)', borderRadius: 8,
                                                border: '1px solid var(--border)', marginBottom: 8,
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                                        <Badge tone={sp.color}>{sp.badge}</Badge>
                                                        <strong style={{ fontSize: 14 }}>{sp.name}</strong>
                                                    </div>
                                                    <small style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{sp.article}</small>
                                                    <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>
                                                        Остаток: <strong>{sp.stock} шт.</strong>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>{formatMoney(sp.price, currency)}</div>
                                                    <Button size="sm" onClick={() => addPartToOrder(sp)} disabled={!sp.available}>
                                                        {sp.available ? '+ В заказ' : 'Нет'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Секция: Поставщики */}
                                {suggestedParts.some(p => p.type === 'external') && (
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase' }}>
                                            🚚 Предложения поставщиков
                                        </div>
                                        {suggestedParts.filter(p => p.type === 'external').map(sp => (
                                            <div key={`ext-${sp.id}`} style={{
                                                padding: 12, background: 'var (--bg)', /* Желтоватый фон для внешнего источника */
                                                borderRadius: 8, border: '1px solid #fde68a', marginBottom: 8,
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                                        <Badge tone={sp.color}>{sp.badge}</Badge>
                                                        <strong style={{ fontSize: 14 }}>{sp.name}</strong>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                                        От: <strong>{sp.supplier}</strong> ⭐ {sp.rating}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>
                                                        Доставка: <strong>{sp.delivery}</strong>
                                                        {sp.hint && <span style={{ marginLeft: 8, color: 'var(--success)', fontWeight: 700 }}>• {sp.hint}</span>}
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>{formatMoney(sp.price, currency)}</div>
                                                    <Button size="sm" variant="secondary" onClick={() => addPartToOrder(sp)} disabled={!sp.inStock}>
                                                        {sp.inStock ? 'Заказать' : 'Нет в наличии'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Выбранные позиции */}
                        {formData.usedParts.length > 0 && (
                            <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px dashed var(--border)' }}>
                                <h5 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>В заказе:</h5>
                                {formData.usedParts.map((up, idx) => {
                                    const part = data.parts.find(p => p.id === up.partId);
                                    if (!part) return null;
                                    return (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--surface-2)' }}>
                                            <span style={{ fontSize: 13 }}>{part.name}</span>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={up.quantity}
                                                    onChange={(e) => updateQuantity(idx, e.target.value)}
                                                    style={{ width: 50, height: 28, padding: 0.5 }}
                                                />
                                                <span style={{ fontWeight: 700, width: 60, textAlign: 'right' }}>{formatMoney(part.priceSell * up.quantity, currency)}</span>
                                                <Button size="sm" variant="ghost" onClick={() => removePart(idx)}>✕</Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 4. Акт Осмотра */}
                <Card padded={false}>
                    <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                            <Checkbox label="Кузов цел?" checked={!formData.inspection.bodyDamage} onChange={(e) => setFormData({ ...formData, inspection: { ...formData.inspection, bodyDamage: !e.target.checked } })} />
                            <Select label="Шины" value={formData.inspection.tireWear} onChange={(e) => setFormData({ ...formData, inspection: { ...formData.inspection, tireWear: e.target.value } })} options={[{ value: 'normal', label: 'Норма' }, { value: 'bald', label: 'Лысые' }]} />
                            <Select label="Масло" value={formData.inspection.oilLevel} onChange={(e) => setFormData({ ...formData, inspection: { ...formData.inspection, oilLevel: e.target.value } })} options={[{ value: 'ok', label: 'Норма' }, { value: 'low', label: 'Мало' }]} />
                        </div>

                        <Textarea
                            label="Жалобы клиента / Примечания"
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Например: стук справа на ямах..."
                            style={{ marginTop: 15 }}
                        />
                    </div>
                </Card>

            </div>
        </Modal>
    );
}

export default OrderFormModal;