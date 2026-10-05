// src/pages/ClientsPage.jsx

import { useMemo, useState } from 'react';
import { useData, useDataDispatch } from '../context/DataContext';
import { useUi } from '../context/UiContext';

// ИМПОРТЫ UI КОМПОНЕНТОВ (Прямые пути, чтобы избежать ошибок index.js)
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterChips } from '../components/ui/FilterChips';
import { IconButton } from '../components/ui/Button'; // IconButton тоже в Button.jsx
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';

// ИМПОРТ НОВОГО КОМПОНЕНТА (Проверь, что файл существует!)
import { ClientDetailsDrawer } from '../components/clients/ClientDetailsDrawer';

// УТИЛИТЫ
import { addDays, daysUntil, dueLabel, formatDate, toISODate } from '../utils/dates';
import { formatMoney } from '../utils/format';
import { uid } from '../utils/id';

const createEmptyForm = () => ({
    name: '',
    phone: '',
    nextService: addDays(toISODate(), 180),
    tags: [],
});

export function ClientsPage() {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast, askConfirm } = useUi();

    const currency = data.settings?.currency || 'BYN';

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState({ key: 'nextService', direction: 'asc' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(createEmptyForm);

    const [drawerClientId, setDrawerClientId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const clients = data.clients || [];

    const counts = useMemo(() => {
        return {
            all: clients.length,
            vip: clients.filter((c) => (c.tags || []).includes('VIP')).length,
            due: clients.filter((c) => {
                const diff = daysUntil(c.nextService);
                return diff >= 0 && diff <= 14;
            }).length,
            overdue: clients.filter((c) => daysUntil(c.nextService) < 0).length,
        };
    }, [clients]);

    const rows = useMemo(() => {
        let list = [...clients];
        const search = query.trim().toLowerCase();

        if (search) {
            list = list.filter((c) => {
                const haystack = [c.name, c.phone, ...(c.tags || [])].join(' ').toLowerCase();
                return haystack.includes(search);
            });
        }

        if (filter === 'vip') list = list.filter((c) => (c.tags || []).includes('VIP'));
        if (filter === 'due') list = list.filter((c) => {
            const diff = daysUntil(c.nextService);
            return diff >= 0 && diff <= 14;
        });
        if (filter === 'overdue') list = list.filter((c) => daysUntil(c.nextService) < 0);

        list.sort((a, b) => {
            const dir = sort.direction === 'asc' ? 1 : -1;
            if (sort.key === 'totalPaid') {
                return ((Number(a.totalPaid) || 0) - (Number(b.totalPaid) || 0)) * dir;
            }
            return String(a[sort.key] || '').localeCompare(String(b[sort.key] || '')) * dir;
        });

        return list;
    }, [clients, query, filter, sort]);

    const openAdd = () => {
        setEditingId(null);
        setForm(createEmptyForm());
        setIsModalOpen(true);
    };

    const openEdit = (client) => {
        setEditingId(client.id);
        setForm({ ...client, tags: client.tags || [] });
        setIsModalOpen(true);
    };

    const openDetails = (client) => {
        setDrawerClientId(client.id);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setDrawerClientId(null), 300);
    };

    const saveClient = () => {
        if (!form.name.trim() || !form.phone.trim()) {
            addToast({ tone: 'danger', title: 'Ошибка', description: 'Нужны имя и телефон' });
            return;
        }

        const payload = {
            id: editingId || uid(),
            name: form.name.trim(),
            phone: form.phone.trim(),
            tags: Array.isArray(form.tags) ? form.tags : [],
            lastVisit: form.lastVisit || toISODate(),
            nextService: form.nextService || addDays(toISODate(), 180),
            totalPaid: Number(form.totalPaid) || 0,
            status: 'active',
        };

        if (editingId) {
            dispatch({ type: 'UPDATE', entity: 'clients', id: editingId, patch: payload });
            addToast({ tone: 'success', title: 'Клиент обновлен' });
        } else {
            dispatch({ type: 'ADD', entity: 'clients', item: payload });
            addToast({ tone: 'success', title: 'Клиент добавлен' });
        }

        setIsModalOpen(false);
    };

    const removeClient = async (client) => {
        const confirmed = await askConfirm({
            title: 'Удалить клиента?',
            description: `${client.name} будет удален.`,
            confirmText: 'Удалить',
            tone: 'danger',
        });
        if (!confirmed) return;

        dispatch({ type: 'DELETE', entity: 'clients', id: client.id });
        addToast({ tone: 'success', title: 'Клиент удален' });
    };

    const columns = [
        {
            key: 'name',
            header: 'Клиент',
            sortable: true,
            render: (row) => (
                <div className="user-cell">
                    <Avatar name={row.name} size={38} />
                    <div>
                        <strong>{row.name}</strong>
                        <small>{row.phone}</small>
                    </div>
                </div>
            ),
        },
        {
            key: 'tags',
            header: 'Теги',
            render: (row) => (
                <div className="tag-list">
                    {(row.tags || []).slice(0, 2).map((tag) => (
                        <Badge key={tag} tone={tag === 'VIP' ? 'warning' : 'neutral'}>
                            {tag}
                        </Badge>
                    ))}
                    {row.tags?.length > 2 && <Badge tone="neutral">+{row.tags.length - 2}</Badge>}
                </div>
            ),
        },
        {
            key: 'lastVisit',
            header: 'Последний визит',
            sortable: true,
            render: (row) => formatDate(row.lastVisit),
        },
        {
            key: 'nextService',
            header: 'Следующий визит',
            sortable: true,
            render: (row) => {
                const diff = daysUntil(row.nextService);
                const className = diff < 0 ? 'text-danger' : diff <= 7 ? 'text-warning' : 'text-muted';
                return (
                    <div>
                        <div className={className}>{formatDate(row.nextService)}</div>
                        <small className={className}>{dueLabel(diff)}</small>
                    </div>
                );
            },
        },
        {
            key: 'totalPaid',
            header: 'Оплачено',
            align: 'right',
            sortable: true,
            render: (row) => formatMoney(row.totalPaid, currency),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (row) => (
                <div className="row-actions">
                    <IconButton onClick={() => openDetails(row)} aria-label="Подробнее" title="Профиль клиента">
                        👁
                    </IconButton>
                    <IconButton onClick={() => openEdit(row)} aria-label="Редактировать" title="Редактировать">
                        ✏️
                    </IconButton>
                    <IconButton variant="danger" onClick={() => removeClient(row)} aria-label="Удалить" title="Удалить">
                        🗑
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div className="stack">
            <PageHeader
                title="Клиенты"
                subtitle="Единая база клиентов, тегов, визитов и сумм"
                actions={<Button onClick={openAdd}>+ Новый клиент</Button>}
            />

            <Card padded={false}>
                <div className="toolbar">
                    <SearchInput value={query} onChange={setQuery} placeholder="Имя, телефон, тег" />
                    <FilterChips
                        value={filter}
                        onChange={setFilter}
                        items={[
                            { value: 'all', label: 'Все', count: counts.all },
                            { value: 'vip', label: 'VIP', count: counts.vip },
                            { value: 'due', label: 'Скоро', count: counts.due },
                            { value: 'overdue', label: 'Просрочено', count: counts.overdue },
                        ]}
                    />
                </div>

                <DataTable
                    columns={columns}
                    rows={rows}
                    sortConfig={sort}
                    onSortChange={setSort}
                    empty={
                        <EmptyState
                            icon="👥"
                            title="Никого не найдено"
                            description="Измените поиск или добавьте нового клиента"
                            action={<Button onClick={openAdd}>Добавить клиента</Button>}
                        />
                    }
                />
            </Card>

            {/* Модалка добавления/редактирования */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Редактировать клиента' : 'Новый клиент'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Отмена</Button>
                        <Button onClick={saveClient}>Сохранить</Button>
                    </>
                }
            >
                <div className="form-grid">
                    <Input
                        label="Имя клиента"
                        value={form.name}
                        onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Иван Петров"
                    />
                    <Input
                        label="Телефон"
                        value={form.phone}
                        onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+375 ..."
                    />
                    <Input
                        label="Следующий визит"
                        type="date"
                        value={form.nextService}
                        onChange={(e) => setForm(p => ({ ...p, nextService: e.target.value }))}
                    />
                    {/* Простой ввод тегов через запятую для демо */}
                    <Input
                        label="Теги (через запятую)"
                        value={Array.isArray(form.tags) ? form.tags.join(', ') : ''}
                        onChange={(e) => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                        placeholder="VIP, постоянный"
                    />
                </div>
            </Modal>

            {/* Карточка клиента (Drawer) */}
            {typeof ClientDetailsDrawer === 'function' ? (
                <ClientDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={closeDrawer}
                    clientId={drawerClientId}
                />
            ) : (
                <div style={{ padding: 20, color: 'red' }}>Ошибка: ClientDetailsDrawer не найден. Проверь путь импорта.</div>
            )}
        </div>
    );
}

export default ClientsPage;