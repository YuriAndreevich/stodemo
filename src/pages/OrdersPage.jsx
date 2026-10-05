// import { useMemo, useState } from 'react';
// import { useData, useDataDispatch } from '../context/DataContext';
// import { useUi } from '../context/UiContext';
// import {
//     Button,
//     Card,
//     DataTable,
//     EmptyState,
//     IconButton,
//     PageHeader,
//     StatusBadge,
//     Tabs,
// } from '../components/ui';
// import { formatDate } from '../utils/dates';
// import { formatMoney } from '../utils/format';

// const STATUS_TABS = [
//     { value: 'all', label: 'Все' },
//     { value: 'new', label: 'Новые' },
//     { value: 'scheduled', label: 'Запланированные' },
//     { value: 'in_progress', label: 'В работе' },
//     { value: 'waiting_part', label: 'Ждут запчасть' },
//     { value: 'ready', label: 'Готовы' },
//     { value: 'done', label: 'Выполнены' },
// ];

// export function OrdersPage() {
//     const data = useData();
//     const dispatch = useDataDispatch();
//     const { addToast, askConfirm } = useUi();

//     const currency = data.settings.currency;
//     const [status, setStatus] = useState('all');

//     const orders = data.orders || [];

//     const counts = useMemo(() => {
//         const map = { all: orders.length };

//         orders.forEach((order) => {
//             map[order.status] = (map[order.status] || 0) + 1;
//         });

//         return map;
//     }, [orders]);

//     const rows = useMemo(() => {
//         if (status === 'all') return orders;
//         return orders.filter((order) => order.status === status);
//     }, [orders, status]);

//     const changeStatus = (order, nextStatus) => {
//         const patch = { status: nextStatus };

//         if (nextStatus === 'done') {
//             patch.paid = order.total;
//         }

//         dispatch({
//             type: 'UPDATE',
//             entity: 'orders',
//             id: order.id,
//             patch,
//         });

//         addToast({
//             tone: 'success',
//             title: 'Статус обновлён',
//             description: `Заказ ${order.number}: ${nextStatus}`,
//         });
//     };

//     const removeOrder = async (order) => {
//         const confirmed = await askConfirm({
//             title: 'Удалить заказ?',
//             description: `Заказ ${order.number} будет удалён из демо-базы.`,
//             confirmText: 'Удалить',
//             tone: 'danger',
//         });

//         if (!confirmed) return;

//         dispatch({
//             type: 'DELETE',
//             entity: 'orders',
//             id: order.id,
//         });

//         addToast({
//             tone: 'success',
//             title: 'Заказ удалён',
//         });
//     };

//     const columns = [
//         {
//             key: 'number',
//             header: 'Номер',
//         },
//         {
//             key: 'clientName',
//             header: 'Клиент',
//         },
//         {
//             key: 'vehicle',
//             header: 'Авто',
//         },
//         {
//             key: 'service',
//             header: 'Услуга',
//         },
//         {
//             key: 'status',
//             header: 'Статус',
//             render: (row) => <StatusBadge status={row.status} />,
//         },
//         {
//             key: 'date',
//             header: 'Дата',
//             render: (row) => formatDate(row.date),
//         },
//         {
//             key: 'total',
//             header: 'Сумма',
//             align: 'right',
//             render: (row) => formatMoney(row.total, currency),
//         },
//         {
//             key: 'paid',
//             header: 'Оплачено',
//             align: 'right',
//             render: (row) => formatMoney(row.paid, currency),
//         },
//         {
//             key: 'actions',
//             header: '',
//             align: 'right',
//             render: (row) => (
//                 <div className="row-actions">
//                     {row.status !== 'ready' && row.status !== 'done' ? (
//                         <Button
//                             size="sm"
//                             variant="secondary"
//                             onClick={() => changeStatus(row, 'ready')}
//                         >
//                             Готов
//                         </Button>
//                     ) : null}

//                     {row.status !== 'done' ? (
//                         <Button
//                             size="sm"
//                             onClick={() => changeStatus(row, 'done')}
//                         >
//                             Выполнен
//                         </Button>
//                     ) : null}

//                     <IconButton
//                         variant="danger"
//                         onClick={() => removeOrder(row)}
//                         aria-label="Удалить"
//                     >
//                         🗑
//                     </IconButton>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <div className="stack">
//             <PageHeader
//                 title="Заказы"
//                 subtitle="Заказы-наряды, статусы, суммы и быстрые действия"
//                 actions={
//                     <Button
//                         onClick={() =>
//                             addToast({
//                                 title: 'Новый заказ',
//                                 description: 'Мастер создания заказа будет подключен следующим блоком',
//                             })
//                         }
//                     >
//                         + Заказ
//                     </Button>
//                 }
//             />

//             <Tabs
//                 value={status}
//                 onChange={setStatus}
//                 items={STATUS_TABS.map((tab) => ({
//                     ...tab,
//                     count: counts[tab.value] || 0,
//                 }))}
//             />

//             <Card padded={false}>
//                 <DataTable
//                     columns={columns}
//                     rows={rows}
//                     empty={
//                         <EmptyState
//                             icon="📦"
//                             title="Нет заказов"
//                             description="В этом статусе пока пусто"
//                         />
//                     }
//                 />
//             </Card>
//         </div>
//     );
// }