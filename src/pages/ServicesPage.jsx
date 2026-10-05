// src/pages/ServicesPage.jsx

import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useUi } from '../context/UiContext';
import {
    Badge,
    Button,
    Card,
    DataTable,
    EmptyState,
    FilterChips,
    IconButton,
    PageHeader,
    SearchInput,
} from '../components/ui';
import { formatMoney } from '../utils/format';

export function ServicesPage() {
    const data = useData();
    const { addToast } = useUi();

    const currency = data.settings.currency;
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const services = data.services || [];
    const employees = data.employees || [];

    // Получаем уникальные категории из данных или используем дефолтный список
    const categories = ['all', ...new Set(services.map(s => s.category))];

    const rows = useMemo(() => {
        let list = [...services];
        const search = query.trim().toLowerCase();

        if (search) {
            list = list.filter((s) => {
                const empName = employees.find(e => e.id === s.employeeId)?.name || '';
                return [s.name, s.category, empName].join(' ').toLowerCase().includes(search);
            });
        }

        if (categoryFilter !== 'all') {
            list = list.filter((s) => s.category === categoryFilter);
        }

        return list;
    }, [services, query, categoryFilter, employees]);

    const getEmployeeName = (empId) => {
        const emp = employees.find(e => e.id === empId);
        return emp ? emp.name : '—';
    };

    const columns = [
        {
            key: 'name',
            header: 'Название услуги',
            render: (row) => (
                <div>
                    <strong>{row.name}</strong>
                    {!row.active && <Badge tone="neutral" style={{ marginLeft: 8 }}>Скрыта</Badge>}
                </div>
            ),
        },
        {
            key: 'category',
            header: 'Категория',
            render: (row) => <Badge tone="info">{row.category}</Badge>,
        },
        {
            key: 'price',
            header: 'Цена',
            align: 'right',
            render: (row) => <span style={{ fontWeight: 700 }}>{formatMoney(row.price, currency)}</span>,
        },
        {
            key: 'duration',
            header: 'Время',
            align: 'right',
            render: (row) => `${row.duration} мин`,
        },
        {
            key: 'employee',
            header: 'Мастер',
            render: (row) => getEmployeeName(row.employeeId),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (row) => (
                <div className="row-actions">
                    <IconButton onClick={() => addToast({ title: 'Редактирование', description: row.name })}>✏️</IconButton>
                </div>
            ),
        },
    ];

    return (
        <div className="stack">
            <PageHeader
                title="Каталог услуг"
                subtitle="Справочник работ, цен и ответственных мастеров"
                actions={
                    <Button onClick={() => addToast({ title: 'Новая услуга', description: 'Форма будет добавлена позже' })}>
                        + Услуга
                    </Button>
                }
            />

            <Card padded={false}>
                <div className="toolbar">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Поиск по названию или мастеру..."
                    />

                    <FilterChips
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        items={categories.map(cat => ({
                            value: cat,
                            label: cat === 'all' ? 'Все' : cat,
                        }))}
                    />
                </div>

                <DataTable
                    columns={columns}
                    rows={rows}
                    empty={
                        <EmptyState icon="🧰" title="Нет услуг" description="Добавьте первую услугу в каталог" />
                    }
                />
            </Card>
        </div>
    );
}

export default ServicesPage;