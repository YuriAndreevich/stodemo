// // src/components/services/ServicesBoard.jsx

// import { useState, useMemo } from 'react';
// import { useData, useDataDispatch } from '../../context/DataContext';
// import { useUi } from '../../context/UiContext';
// import { Card, Button, Badge, Modal, Input, Select, Textarea, EmptyState } from '../ui';
// import { cn } from '../../utils/cn';
// import { formatMoney } from '../../utils/format';
// import { uid } from '../../utils/id';

// // Константы категорий для колонок
// const CATEGORIES = ['ТО', 'Двигатель', 'Подвеска', 'Тормоза', 'Электрика', 'Кондиционер', 'Шиномонтаж', 'Диагностика', 'Кузов'];

// export function ServicesBoard() {
//     const data = useData();
//     const dispatch = useDataDispatch();
//     const { addToast } = useUi();

//     const [draggedServiceId, setDraggedServiceId] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingId, setEditingId] = useState(null);

//     // Форма новой услуги
//     const [form, setForm] = useState({
//         name: '',
//         category: 'ТО',
//         price: '',
//         duration: '',
//         employeeId: '',
//         active: true,
//     });

//     const services = data.services || [];
//     const employees = data.employees || [];

//     // Группируем услуги по категориям
//     const groupedServices = useMemo(() => {
//         const groups = {};
//         CATEGORIES.forEach(cat => { groups[cat] = []; });

//         services.forEach(service => {
//             if (!groups[service.category]) {
//                 groups[service.category] = [];
//             }
//             groups[service.category].push(service);
//         });

//         return groups;
//     }, [services]);

//     // --- DRAG AND DROP HANDLERS ---

//     const handleDragStart = (e, serviceId) => {
//         setDraggedServiceId(serviceId);
//         e.dataTransfer.effectAllowed = 'move';
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault(); // Разрешаем drop
//         e.dataTransfer.dropEffect = 'move';
//     };

//     const handleDrop = (e, targetCategory) => {
//         e.preventDefault();
//         if (!draggedServiceId) return;

//         const service = services.find(s => s.id === draggedServiceId);
//         if (service && service.category !== targetCategory) {
//             dispatch({
//                 type: 'UPDATE',
//                 entity: 'services',
//                 id: draggedServiceId,
//                 patch: { category: targetCategory }
//             });
//             addToast({ tone: 'success', title: 'Услуга перемещена', description: `В категорию "${targetCategory}"` });
//         }

//         setDraggedServiceId(null);
//     };

//     // --- CRUD ACTIONS ---

//     const openAdd = () => {
//         setEditingId(null);
//         setForm({
//             name: '',
//             category: 'ТО',
//             price: '',
//             duration: '',
//             employeeId: '',
//             active: true,
//         });
//         setIsModalOpen(true);
//     };

//     const openEdit = (service) => {
//         setEditingId(service.id);
//         setForm({
//             name: service.name,
//             category: service.category,
//             price: String(service.price),
//             duration: String(service.duration),
//             employeeId: service.employeeId || '',
//             active: service.active,
//         });
//         setIsModalOpen(true);
//     };

//     const saveService = () => {
//         if (!form.name.trim()) {
//             addToast({ tone: 'danger', title: 'Ошибка', description: 'Название обязательно' });
//             return;
//         }

//         const payload = {
//             id: editingId || uid(),
//             name: form.name.trim(),
//             category: form.category,
//             price: Number(form.price) || 0,
//             duration: Number(form.duration) || 0,
//             employeeId: form.employeeId || null,
//             active: form.active,
//         };

//         if (editingId) {
//             dispatch({ type: 'UPDATE', entity: 'services', id: editingId, patch: payload });
//             addToast({ tone: 'success', title: 'Услуга обновлена' });
//         } else {
//             dispatch({ type: 'ADD', entity: 'services', item: payload });
//             addToast({ tone: 'success', title: 'Услуга создана' });
//         }

//         setIsModalOpen(false);
//     };

//     const toggleActive = (id, currentStatus) => {
//         dispatch({
//             type: 'UPDATE',
//             entity: 'services',
//             id,
//             patch: { active: !currentStatus }
//         });
//     };

//     const getEmployeeName = (empId) => {
//         const emp = employees.find(e => e.id === empId);
//         return emp ? emp.name : 'Не назначен';
//     };

//     return (
//         <div className="stack">
//             {/* Header */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                 <h2>Каталог услуг</h2>
//                 <Button onClick={openAdd}>+ Новая услуга</Button>
//             </div>

//             {/* Board Container */}
//             <div style={{
//                 display: 'flex',
//                 gap: 16,
//                 overflowX: 'auto',
//                 paddingBottom: 20,
//                 minHeight: 'calc(100vh - 250px)'
//             }}>

//                 {CATEGORIES.map(category => {
//                     const items = groupedServices[category] || [];

//                     return (
//                         <div
//                             key={category}
//                             onDragOver={handleDragOver}
//                             onDrop={(e) => handleDrop(e, category)}
//                             style={{
//                                 minWidth: 280,
//                                 maxWidth: 320,
//                                 flexShrink: 0,
//                                 background: 'var(--surface)',
//                                 borderRadius: 16,
//                                 border: '1px solid var(--border)',
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                             }}
//                         >
//                             {/* Column Header */}
//                             <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
//                                 <span>{category}</span>
//                                 <Badge tone="neutral">{items.length}</Badge>
//                             </div>

//                             {/* Cards List */}
//                             <div style={{ padding: 12, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
//                                 {items.length === 0 ? (
//                                     <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 13, padding: 20 }}>
//                                         Перетащите услугу сюда
//                                     </div>
//                                 ) : (
//                                     items.map(service => (
//                                         <Card
//                                             key={service.id}
//                                             draggable
//                                             onDragStart={(e) => handleDragStart(e, service.id)}
//                                             style={{
//                                                 cursor: 'grab',
//                                                 opacity: draggedServiceId === service.id ? 0.5 : 1,
//                                                 borderLeft: `4px solid ${service.active ? 'var(--primary)' : 'var(--dim)'}`
//                                             }}
//                                             padded={false}
//                                         >
//                                             <div style={{ padding: 12 }}>
//                                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                                                     <strong style={{ fontSize: 15 }}>{service.name}</strong>
//                                                     {!service.active && <Badge tone="neutral">Скрыта</Badge>}
//                                                 </div>

//                                                 <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
//                                                     <div>💰 {formatMoney(service.price)}</div>
//                                                     <div>⏱ {service.duration} мин</div>
//                                                     <div>👨‍🔧 {getEmployeeName(service.employeeId)}</div>
//                                                 </div>

//                                                 <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
//                                                     <Button size="sm" variant="ghost" onClick={() => openEdit(service)}>✏️ Изменить</Button>
//                                                     <Button size="sm" variant="ghost" onClick={() => toggleActive(service.id, service.active)}>
//                                                         {service.active ? 'Скрыть' : 'Показать'}
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         </Card>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Create/Edit Modal */}
//             <Modal
//                 open={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 title={editingId ? 'Редактировать услугу' : 'Новая услуга'}
//                 footer={
//                     <>
//                         <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Отмена</Button>
//                         <Button onClick={saveService}>Сохранить</Button>
//                     </>
//                 }
//             >
//                 <div className="form-grid">
//                     <Input
//                         label="Название услуги"
//                         value={form.name}
//                         onChange={e => setForm({ ...form, name: e.target.value })}
//                         placeholder="Например: Замена ремня ГРМ"
//                     />

//                     <Select
//                         label="Категория"
//                         value={form.category}
//                         onChange={e => setForm({ ...form, category: e.target.value })}
//                         options={CATEGORIES.map(c => ({ value: c, label: c }))}
//                     />

//                     <Input
//                         label="Цена (BYN)"
//                         type="number"
//                         value={form.price}
//                         onChange={e => setForm({ ...form, price: e.target.value })}
//                         placeholder="150"
//                     />

//                     <Input
//                         label="Время выполнения (мин)"
//                         type="number"
//                         value={form.duration}
//                         onChange={e => setForm({ ...form, duration: e.target.value })}
//                         placeholder="60"
//                     />

//                     <Select
//                         label="Ответственный мастер"
//                         value={form.employeeId}
//                         onChange={e => setForm({ ...form, employeeId: e.target.value })}
//                         options={[
//                             { value: '', label: 'Не назначен' },
//                             ...employees.map(emp => ({ value: emp.id, label: `${emp.name} (${emp.specialization})` }))
//                         ]}
//                     />

//                     <label className="checkbox full" style={{ gridColumn: 'span 2' }}>
//                         <input
//                             type="checkbox"
//                             checked={form.active}
//                             onChange={e => setForm({ ...form, active: e.target.checked })}
//                         />
//                         <span>Услуга активна (видна клиентам)</span>
//                     </label>
//                 </div>
//             </Modal>
//         </div>
//     );
// }
