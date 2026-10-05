// src/pages/PartsPage.jsx

import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge, Button, DataTable, EmptyState, SearchInput, FilterChips } from '../components/ui';
import { formatMoney } from '../utils/format';
import { cn } from '../utils/cn';

export function PartsPage() {
    const data = useData();
    const currency = data.settings?.currency || 'BYN';

    // Безопасный доступ к массиву частей
    const parts = Array.isArray(data.parts) ? data.parts : [];

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, low_stock, out_of_stock

    // --- СТАТИСТИКА ДЛЯ KPI КАРТОЧЕК ---
    const stats = useMemo(() => {
        if (!parts.length) return { totalValue: 0, lowCount: 0, outCount: 0 };

        const totalValue = parts.reduce((sum, p) => sum + (p.stock * p.priceBuy), 0);
        const lowCount = parts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
        const outCount = parts.filter(p => p.stock === 0).length;

        return { totalValue, lowCount, outCount };
    }, [parts]);

    // --- ФИЛЬТРАЦИЯ ДАННЫХ ---
    const filteredParts = useMemo(() => {
        let list = [...parts];

        // Поиск по тексту
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.article.toLowerCase().includes(q) ||
                (p.supplier && p.supplier.toLowerCase().includes(q))
            );
        }

        // Фильтр по статусу остатка
        if (filter === 'low_stock') {
            list = list.filter(p => p.stock <= p.minStock && p.stock > 0);
        } else if (filter === 'out_of_stock') {
            list = list.filter(p => p.stock === 0);
        }

        return list;
    }, [parts, query, filter]);

    // --- КОЛОНКИ ДЛЯ DATATABLE ---
    const columns = [
        {
            key: 'name',
            header: 'Название / Артикул',
            render: (row) => (
                <div>
                    <strong style={{ display: 'block' }}>{row.name}</strong>
                    <small style={{ color: 'var(--muted)' }}>
                        {row.article} • {row.supplier}
                    </small>
                </div>
            ),
        },
        {
            key: 'stock',
            header: 'Остаток',
            align: 'center',
            render: (row) => (
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                    {row.stock} шт.
                </span>
            ),
        },
        {
            key: 'priceBuy',
            header: 'Закупка',
            align: 'right',
            render: (row) => (
                <span style={{ color: 'var(--muted)' }}>
                    {formatMoney(row.priceBuy, currency)}
                </span>
            ),
        },
        {
            key: 'priceSell',
            header: 'Продажа',
            align: 'right',
            render: (row) => (
                <span style={{ fontWeight: 700 }}>
                    {formatMoney(row.priceSell, currency)}
                </span>
            ),
        },
        {
            key: 'margin',
            header: 'Маржа',
            align: 'right',
            render: (row) => {
                const margin = row.priceBuy > 0 ? ((row.priceSell - row.priceBuy) / row.priceBuy) * 100 : 0;
                return (
                    <Badge tone={margin > 30 ? 'success' : margin > 10 ? 'warning' : 'neutral'}>
                        {Math.round(margin)}%
                    </Badge>
                );
            },
        },
        {
            key: 'status',
            header: 'Статус',
            render: (row) => {
                if (row.stock === 0) return <Badge tone="danger">Нет в наличии</Badge>;
                if (row.stock <= row.minStock) return <Badge tone="warning">Мало ({row.stock})</Badge>;
                return <Badge tone="success">В норме</Badge>;
            },
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: () => (
                <Button size="sm" variant="ghost">✏️</Button>
            ),
        },
    ];

    return (
        <div className="stack">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>📦 Склад запчастей</h2>
                <Button>+ Добавить позицию</Button>
            </div>

            {/* KPI Карточки */}
            <div className="grid grid-3" style={{ gap: 16, marginBottom: 20 }}>
                <Card className="kpi kpi-accent">
                    <div className="kpi-top"><span>Стоимость запасов</span><span>💰</span></div>
                    <strong>{formatMoney(stats.totalValue, currency)}</strong>
                    <small>По закупочной цене</small>
                </Card>

                <Card className={cn('kpi', stats.lowCount > 0 ? 'kpi-warning' : 'kpi-neutral')}>
                    <div className="kpi-top"><span>Низкий остаток</span><span>⚠️</span></div>
                    <strong>{stats.lowCount}</strong>
                    <small>Позиций ниже минимума</small>
                </Card>

                <Card className={cn('kpi', stats.outCount > 0 ? 'kpi-danger' : 'kpi-neutral')}>
                    <div className="kpi-top"><span>Отсутствует</span><span>❌</span></div>
                    <strong>{stats.outCount}</strong>
                    <small>Нулевой остаток</small>
                </Card>
            </div>

            <Card padded={false}>
                <div className="toolbar">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Поиск по названию или артикулу..."
                    />
                    <FilterChips
                        value={filter}
                        onChange={setFilter}
                        items={[
                            { value: 'all', label: 'Все позиции' },
                            { value: 'low_stock', label: 'Низкий остаток', count: stats.lowCount },
                            { value: 'out_of_stock', label: 'Нет в наличии', count: stats.outCount },
                        ]}
                    />
                </div>

                <DataTable
                    columns={columns}
                    rows={filteredParts}
                    empty={
                        <EmptyState
                            icon="📦"
                            title="Ничего не найдено"
                            description={parts.length === 0 ? "Список запчастей пуст. Добавьте первую позицию." : "Измените фильтры или поисковый запрос"}
                        />
                    }
                />
            </Card>
        </div>
    );
}

export default PartsPage;