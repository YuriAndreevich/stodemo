// src/components/orders/OrderPrintView.jsx

import { useMemo } from 'react';
import { Modal, Button } from '../ui';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';

export function OrderPrintView({ isOpen, onClose, order }) {
    const data = useMemo(() => {
        if (!order) return null;

        // Здесь мы могли бы достать клиента и авто из контекста, 
        // но для простоты передадим их как пропсы или найдем внутри компонента родителя.
        // Для демо предположим, что родитель передает уже готовые объекты client и vehicle.
        return {
            ...order,
            // Эти поля должны быть переданы родителем при вызове <OrderPrintView client={...} vehicle={...} />
        };
    }, [order]);

    if (!isOpen || !data) return null;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title="Предпросмотр печатной формы"
            size="xl"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Закрыть</Button>
                    <Button onClick={() => window.print()}>🖨 Печать / Сохранить PDF</Button>
                </>
            }
        >
            {/* Стили для печати (скрытие лишних элементов интерфейса) */}
            <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>

            <div className="print-area" style={{
                background: '#fff',
                color: '#000',
                padding: 40,
                fontFamily: 'Arial, sans-serif',
                fontSize: 14,
                lineHeight: 1.5,
                borderRadius: 8,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>

                {/* Шапка */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, borderBottom: '2px solid #000', paddingBottom: 10 }}>
                    <div>
                        <h2 style={{ margin: 0, textTransform: 'uppercase' }}>Автосервис Demo</h2>
                        <p style={{ margin: 0, fontSize: 12 }}>г. Новополоцк, ул. Еронько, 13<br />+375 29 640-94-91</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: 0 }}>ЗАКАЗ-НАРЯД №{data.number}</h3>
                        <p style={{ margin: 0, fontSize: 12 }}>Дата: {formatDate(data.date)}</p>
                    </div>
                </div>

                {/* Данные клиента и авто */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                        <strong>Клиент:</strong><br />
                        {data.clientName}<br />
                        Тел: {data.clientPhone}
                    </div>
                    <div>
                        <strong>Автомобиль:</strong><br />
                        {data.vehicleMake} {data.vehicleModel}<br />
                        Госномер: {data.vehiclePlate}<br />
                        Пробег: {data.vehicleMileage} км
                    </div>
                </div>

                {/* Таблица работ */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>№</th>
                            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Наименование работы/детали</th>
                            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>Ед.</th>
                            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>Цена</th>
                            <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Работы */}
                        <tr>
                            <td style={{ border: '1px solid #ddd', padding: 8 }}>1</td>
                            <td style={{ border: '1px solid #ddd', padding: 8 }}>{data.serviceName}</td>
                            <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>шт</td>
                            <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{formatMoney(data.laborCost)}</td>
                            <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{formatMoney(data.laborCost)}</td>
                        </tr>

                        {/* Запчасти */}
                        {data.usedParts && data.usedParts.map((part, idx) => (
                            <tr key={idx}>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>{idx + 2}</td>
                                <td style={{ border: '1px solid #ddd', padding: 8 }}>{part.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>{part.quantity} шт</td>
                                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{formatMoney(part.price)}</td>
                                <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>{formatMoney(part.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="4" style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right', fontWeight: 'bold' }}>ИТОГО К ОПЛАТЕ:</td>
                            <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right', fontWeight: 'bold', fontSize: 16 }}>{formatMoney(data.total)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Акт осмотра (если есть) */}
                {data.inspection && (
                    <div style={{ marginTop: 20, padding: 10, border: '1px dashed #ccc', fontSize: 12 }}>
                        <strong>Акт осмотра ТС:</strong><br />
                        Кузов: {data.inspection.bodyDamage ? 'Повреждения выявлены' : 'Без повреждений'}<br />
                        Шины: {data.inspection.tireWear === 'normal' ? 'Норма' : data.inspection.tireWear === 'uneven' ? 'Неравномерный износ' : 'Изношены'}<br />
                        Жидкости: Масло ({data.inspection.oilLevel}), Антифриз ({data.inspection.coolantLevel}), Тормоза ({data.inspection.brakeFluid})
                    </div>
                )}

                {/* Подписи */}
                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        Мастер: _________________________<br />
                        <small>(Подпись)</small>
                    </div>
                    <div>
                        Клиент: _________________________<br />
                        <small>(Принято к исполнению)</small>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
export default OrderPrintView;