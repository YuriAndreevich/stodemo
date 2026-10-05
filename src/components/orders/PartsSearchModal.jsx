// src/components/orders/PartsSearchModal.jsx

import { useState, useMemo } from 'react';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useUi } from '../../context/UiContext';
import { Modal, Button, Input, Badge, Card, EmptyState } from '../ui';
import { formatMoney } from '../../utils/format';
import { cn } from '../../utils/cn';

export function PartsSearchModal({ isOpen, onClose, orderId }) {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast } = useUi();

    const [searchQuery, setSearchQuery] = useState('');

    const parts = data.parts || [];
    const offers = data.suppliersOffers || [];
    const orders = data.orders || [];

    // Находим текущий заказ для контекста
    const currentOrder = orders.find(o => o.id === orderId);

    // --- ЛОГИКА ПОИСКА ---
    const results = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const q = searchQuery.toLowerCase();

        // 1. Ищем свои остатки
        const localMatches = parts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.article.toLowerCase().includes(q)
        ).map(p => ({
            type: 'local',
            id: p.id,
            name: p.name,
            article: p.article,
            price: p.priceSell,
            stock: p.stock,
            available: p.stock > 0
        }));

        // 2. Ищем предложения поставщиков (если локальных мало или нет)
        const externalMatches = offers.filter(o =>
            o.partArticle.toLowerCase().includes(q) ||
            o.supplierName.toLowerCase().includes(q)
        ).map(o => ({
            type: 'external',
            id: o.id,
            name: `Аналог/Поставщик: ${o.supplierName}`,
            article: o.partArticle,
            price: o.price,
            delivery: `${o.deliveryDays} дн.`,
            available: true // Поставщики обычно имеют товар
        }));

        return [...localMatches, ...externalMatches];
    }, [searchQuery, parts, offers]);

    // --- ДЕЙСТВИЯ ---

    const handleUseLocalPart = (partId) => {
        if (!currentOrder) return;

        // Добавляем запчасть в заказ
        const newUsedParts = [...(currentOrder.usedParts || []), { partId, quantity: 1 }];

        dispatch({
            type: 'UPDATE',
            entity: 'orders',
            id: currentOrder.id,
            patch: { usedParts: newUsedParts }
        });

        addToast({ tone: 'success', title: 'Добавлено со склада', description: 'Товар зарезервирован' });
        onClose();
    };

    const handleOrderFromSupplier = (offer) => {
        if (!currentOrder) return;

        // Меняем статус заказа на "Ждет запчасть"
        dispatch({
            type: 'UPDATE',
            entity: 'orders',
            id: currentOrder.id,
            patch: { status: 'waiting_part' }
        });

        addToast({
            tone: 'info',
            title: 'Заявка создана',
            description: `Заказ отправлен поставщику ${offer.supplierName}. Ожидание ~${offer.delivery} дн.`
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            open={true}
            onClose={onClose}
            title="🔍 Проценка и поиск запчастей"
            size="lg"
            footer={<Button variant="ghost" onClick={onClose}>Закрыть</Button>}
        >
            <div className="stack" style={{ gap: 20 }}>

                {/* Поиск */}
                <Input
                    label="Введите название, артикул или VIN"
                    placeholder="Например: TRW-GDB1624 или Колодки..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />

                {/* Результаты */}
                {!searchQuery ? (
                    <EmptyState
                        icon="🛒"
                        title="Начните поиск"
                        description="Введите запрос, чтобы увидеть остатки склада и предложения поставщиков"
                    />
                ) : results.length === 0 ? (
                    <EmptyState
                        icon="❌"
                        title="Ничего не найдено"
                        description="Попробуйте другой артикул или название"
                    />
                ) : (
                    <div className="stack" style={{ gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                        {results.map((res) => (
                            <Card key={`${res.type}-${res.id}`} padded={false}>
                                <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                            <Badge tone={res.type === 'local' ? 'success' : 'info'}>
                                                {res.type === 'local' ? 'СКЛАД' : 'ПОСТАВЩИК'}
                                            </Badge>
                                            <strong>{res.name}</strong>
                                        </div>
                                        <small style={{ color: 'var(--muted)' }}>Артикул: {res.article}</small>
                                        <div style={{ marginTop: 4, fontSize: 13 }}>
                                            {res.type === 'local' ? (
                                                <span>Остаток: <strong>{res.stock} шт.</strong></span>
                                            ) : (
                                                <span>Доставка: <strong>{res.delivery}</strong></span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                                            {formatMoney(res.price)}
                                        </div>

                                        {res.type === 'local' && res.available ? (
                                            <Button size="sm" onClick={() => handleUseLocalPart(res.id)}>
                                                Взять со склада
                                            </Button>
                                        ) : res.type === 'local' && !res.available ? (
                                            <Button size="sm" variant="danger" disabled>
                                                Нет в наличии
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="secondary" onClick={() => handleOrderFromSupplier(res)}>
                                                Заказать у поставщика
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}