// src/data/seed.js

export const makeSeed = () => {
    // 1. Получаем текущую дату в формате YYYY-MM-DD
    const today = new Date();
    const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Хелпер для получения даты N дней назад
    const getDaysAgo = (daysBack) => {
        const d = new Date();
        d.setDate(d.getDate() - daysBack);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Вычисляем даты заранее, чтобы они были одинаковыми во всех объектах
    const dates = {
        t0: isoToday,       // Сегодня
        t1: getDaysAgo(1),  // Вчера
        t2: getDaysAgo(2),  // Позавчера
        t3: getDaysAgo(3),  // 3 дня назад
        t4: getDaysAgo(4),  // 4 дня назад
        t5: getDaysAgo(5),  // 5 дней назад
        t6: getDaysAgo(6),  // 6 дней назад
        future1: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })(), // Завтра
        past95: getDaysAgo(95), // Давно (для истории клиента)
    };

    return {
        // ==========================================
        // 1. МАСТЕРА (с коэффициентом оплаты)
        // ==========================================
        employees: [
            { id: 'e1', name: 'Иван Мастер', role: 'mechanic', specialization: 'ТО, Двигатель', commissionRate: 0.25 },
            { id: 'e2', name: 'Петр Диагност', role: 'diagnostics', specialization: 'Электрика, Компьютерная диагностика', commissionRate: 0.20 },
            { id: 'e3', name: 'Анна Шиномонтаж', role: 'tire', specialization: 'Шины, Диски', commissionRate: 0.15 },
            { id: 'e4', name: 'Сергей Кузовщик', role: 'body', specialization: 'Жестянка, Покраска', commissionRate: 0.30 },
        ],

        // ==========================================
        // 2. КЛИЕНТЫ
        // ==========================================
        clients: [
            { id: 'c1', name: 'Артём Ковалёв', phone: '+375 29 123-45-67', tags: ['VIP'], status: 'active' },
            { id: 'c2', name: 'Дмитрий Соколов', phone: '+375 33 654-32-10', tags: ['новый'], status: 'active' },
            { id: 'c3', name: 'Ольга Романюк', phone: '+375 25 987-65-43', tags: ['постоянный'], status: 'active' },
            { id: 'c4', name: 'Сергей Пух', phone: '+375 29 555-44-33', tags: ['VIP'], status: 'active' },
            { id: 'c5', name: 'Иван Мельник', phone: '+375 33 111-22-33', tags: ['проблемный'], status: 'active' },
            { id: 'c6', name: 'Наталья Зуй', phone: '+375 29 303-40-50', tags: ['спящий'], status: 'active' },
            { id: 'c7', name: 'Павел Гурин', phone: '+375 25 700-80-90', tags: ['корпоративный'], status: 'active' },
            { id: 'c8', name: 'Алексей Дуб', phone: '+375 33 600-11-22', tags: ['новый'], status: 'active' },
        ],

        // ==========================================
        // 3. АВТОМОБИЛИ
        // ==========================================
        // src/data/seed.js (фрагмент изменений)

        vehicles: [
            // Артём владеет двумя машинами
            {
                id: 'v1', clientId: 'c1', make: 'Volkswagen', model: 'Passat B7', plate: 'A123BC-7',
                vin: 'WVWZZZ3CZWE123456', // ДОБАВЛЕНО
                year: 2012, mileage: 187500, lastServiceDate: dates.past95, nextServiceKm: 197500,
                carClass: 'sedan' // Для фильтрации услуг
            },
            {
                id: 'v2', clientId: 'c1', make: 'BMW', model: 'X5 E70', plate: 'H777XX-7',
                vin: 'WBAPK710X0L123456', // ДОБАВЛЕНО
                year: 2010, mileage: 210000, lastServiceDate: dates.t0, nextServiceKm: 220000,
                carClass: 'suv'
            },

            // Дмитрий одна машина
            {
                id: 'v3', clientId: 'c2', make: 'Skoda', model: 'Octavia A7', plate: 'B777MN-7',
                vin: 'TMBAG7NE0G0123456', // ДОБАВЛЕНО
                year: 2015, mileage: 120000, lastServiceDate: dates.t1, nextServiceKm: 130000,
                carClass: 'wagon'
            },

            // Ольга одна машина
            {
                id: 'v4', clientId: 'c3', make: 'Toyota', model: 'Corolla', plate: 'C555KL-7',
                vin: 'JTDBR32E430123456', // ДОБАВЛЕНО
                year: 2018, mileage: 85000, lastServiceDate: dates.t0, nextServiceKm: 95000,
                carClass: 'sedan'
            },

            // Сергей одна машина
            {
                id: 'v5', clientId: 'c4', make: 'Renault', model: 'Duster', plate: 'E222OP-7',
                vin: 'VF1HSJ00X63123456', // ДОБАВЛЕНО
                year: 2019, mileage: 65000, lastServiceDate: dates.t1, nextServiceKm: 75000,
                carClass: 'suv'
            },
        ],

        services: [
            // Добавили compatibleWith: ['all'] означает подходит всем. Или конкретные классы.
            { id: 's1', name: 'Замена масла и фильтров', category: 'ТО', price: 185, duration: 60, active: true, employeeId: 'e1', requiredParts: ['p1', 'p2'], compatibleWith: ['all'] },
            { id: 's2', name: 'Диагностика тормозной системы', category: 'Тормоза', price: 120, duration: 45, active: true, employeeId: 'e2', requiredParts: [], compatibleWith: ['all'] },
            { id: 's3', name: 'Сезонная замена шин', category: 'Шиномонтаж', price: 90, duration: 60, active: true, employeeId: 'e3', requiredParts: [], compatibleWith: ['all'] },
            { id: 's4', name: 'Компьютерная диагностика двигателя', category: 'Диагностика', price: 220, duration: 60, active: true, employeeId: 'e2', requiredParts: [], compatibleWith: ['all'] },
            { id: 's5', name: 'Ремонт электрики', category: 'Электрика', price: 180, duration: 120, active: true, employeeId: 'e2', requiredParts: [], compatibleWith: ['all'] },
            { id: 's6', name: 'Замена колодок передних', category: 'Тормоза', price: 250, duration: 90, active: true, employeeId: 'e1', requiredParts: ['p3'], compatibleWith: ['all'] },
            { id: 's7', name: 'Развал-схождение', category: 'Подвеска', price: 150, duration: 60, active: true, employeeId: 'e3', requiredParts: [], compatibleWith: ['all'] },
            // Пример специфической услуги (только для SUV)
            { id: 's8', name: 'Замена воздушного фильтра (SUV)', category: 'ТО', price: 110, duration: 30, active: true, employeeId: 'e1', requiredParts: [], compatibleWith: ['suv'] },
        ],

        // ==========================================
        // 5. ЗАПЧАСТИ (Новый модуль)
        // ==========================================
        parts: [
            { id: 'p1', name: 'Масло Castrol Edge 5W30 (4л)', article: 'CAS-5W30-4L', stock: 12, minStock: 5, priceBuy: 85, priceSell: 120, supplier: 'AutoDoc', fitsCarClasses: ['sedan', 'wagon', 'suv'] },
            { id: 'p2', name: 'Фильтр масляный Mann W712/95', article: 'MAN-W712', stock: 25, minStock: 10, priceBuy: 15, priceSell: 35, supplier: 'Local', fitsCarClasses: ['sedan', 'wagon'] },
            { id: 'p3', name: 'Колодки тормозные передние TRW', article: 'TRW-GDB1624', stock: 2, minStock: 4, priceBuy: 90, priceSell: 180, supplier: 'TRW Official', fitsCarClasses: ['sedan', 'wagon'] }, // Подходит только легковым
            { id: 'p4', name: 'Шина Michelin CrossClimate 205/55 R16', article: 'MIC-CC2-205R16', stock: 8, minStock: 2, priceBuy: 110, priceSell: 160, supplier: 'Michelin Dist.', fitsCarClasses: ['sedan', 'wagon'] },
            { id: 'p5', name: 'Антифриз Felix G12 (5л)', article: 'FELIX-G12-5L', stock: 0, minStock: 3, priceBuy: 40, priceSell: 65, supplier: 'Felix', fitsCarClasses: ['all'] },
            // НОВАЯ ЗАПЧАСТЬ ДЛЯ SUV (BMW X5)
            { id: 'p6', name: 'Колодки тормозные задние BMW X5', article: 'BMW-X5-BP', stock: 1, minStock: 1, priceBuy: 150, priceSell: 280, supplier: 'Original', fitsCarClasses: ['suv'] },
        ],


        // ==========================================
        // 6. ЗАКАЗЫ (Распределены по дням + Акт Осмотра + Запчасти)
        // ==========================================
        orders: [
            // --- СЕГОДНЯ (t0) ---
            {
                id: 'o-t0-1', number: 'ORD-TODAY-01', clientId: 'c1', vehicleId: 'v2', serviceId: 's4', serviceName: 'Компьютерная диагностика',
                employeeId: 'e2', status: 'in_progress', total: 220, paid: 100, date: dates.t0, notes: 'Check Engine',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-t0-2', number: 'ORD-TODAY-02', clientId: 'c3', vehicleId: 'v4', serviceId: 's3', serviceName: 'Сезонная замена шин',
                employeeId: 'e3', status: 'ready', total: 90, paid: 90, date: dates.t0, notes: '',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'uneven', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-t0-3', number: 'ORD-TODAY-03', clientId: 'c2', vehicleId: 'v3', serviceId: 's2', serviceName: 'Диагностика тормозов',
                employeeId: null, status: 'new', total: 120, paid: 0, date: dates.t0, notes: 'Скрип',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'low', coolantLevel: 'ok', brakeFluid: 'low' }
            },
            {
                id: 'o-t0-4', number: 'ORD-TODAY-04', clientId: 'c4', vehicleId: 'v5', serviceId: 's5', serviceName: 'Ремонт электрики',
                employeeId: 'e2', status: 'waiting_part', total: 180, paid: 0, date: dates.t0, notes: 'Ждем датчик',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            // НОВЫЙ ПРИМЕР С АКТОМ И ЗАПЧАСТЯМИ
            {
                id: 'o-t0-5', number: 'ORD-TODAY-05', clientId: 'c4', vehicleId: 'v5', serviceId: 's6', serviceName: 'Замена колодок передних',
                employeeId: 'e1', status: 'in_progress', total: 430, paid: 0, date: dates.t0, notes: 'Клиент согласен на замену дисков позже.',
                usedParts: [{ partId: 'p3', quantity: 1 }], // 180 BYN запчасти
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'low' }
            },

            // --- ВЧЕРА (t1) --- Выполнено Иваном и Анной
            {
                id: 'o-t1-1', number: 'ORD-YEST-01', clientId: 'c5', vehicleId: 'v6', serviceId: 's1', serviceName: 'Замена масла',
                employeeId: 'e1', status: 'done', total: 185, paid: 185, date: dates.t1, notes: '',
                usedParts: [{ partId: 'p1', quantity: 1 }, { partId: 'p2', quantity: 1 }],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-t1-2', number: 'ORD-YEST-02', clientId: 'c6', vehicleId: 'v7', serviceId: 's6', serviceName: 'Колодки передние',
                employeeId: 'e1', status: 'done', total: 250, paid: 250, date: dates.t1, notes: '',
                usedParts: [{ partId: 'p3', quantity: 1 }],
                inspection: { bodyDamage: true, tireWear: 'bald', oilLevel: 'low', coolantLevel: 'ok', brakeFluid: 'low' }
            },

            // --- ПОЗАВЧЕРА (t2) --- Выполнено Петром и Сергеем
            {
                id: 'o-t2-1', number: 'ORD-DAY2-01', clientId: 'c7', vehicleId: 'v8', serviceId: 's7', serviceName: 'Развал-схождение',
                employeeId: 'e3', status: 'done', total: 150, paid: 150, date: dates.t2, notes: '',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-t2-2', number: 'ORD-DAY2-02', clientId: 'c8', vehicleId: 'v9', serviceId: 's1', serviceName: 'Замена масла',
                employeeId: 'e1', status: 'done', total: 185, paid: 185, date: dates.t2, notes: '',
                usedParts: [{ partId: 'p1', quantity: 1 }, { partId: 'p2', quantity: 1 }],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },

            // --- 3 ДНЯ НАЗАД (t3) --- Большой чек от Петра
            {
                id: 'o-t3-1', number: 'ORD-DAY3-01', clientId: 'c1', vehicleId: 'v1', serviceId: 's2', serviceName: 'Диагностика тормозов',
                employeeId: 'e2', status: 'done', total: 120, paid: 120, date: dates.t3, notes: '',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-t3-2', number: 'ORD-DAY3-02', clientId: 'c2', vehicleId: 'v3', serviceId: 's5', serviceName: 'Ремонт электрики',
                employeeId: 'e2', status: 'done', total: 300, paid: 300, date: dates.t3, notes: 'Проводка',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },

            // --- СТАРЫЕ (для VIP списка и длинного хвоста графика) ---
            {
                id: 'o-old-1', number: 'ORD-OLD-01', clientId: 'c3', vehicleId: 'v4', serviceId: 's1', serviceName: 'Замена масла',
                employeeId: 'e1', status: 'done', total: 185, paid: 185, date: dates.t4, notes: '',
                usedParts: [{ partId: 'p1', quantity: 1 }, { partId: 'p2', quantity: 1 }],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-old-2', number: 'ORD-OLD-02', clientId: 'c4', vehicleId: 'v5', serviceId: 's3', serviceName: 'Шиномонтаж',
                employeeId: 'e3', status: 'done', total: 90, paid: 90, date: dates.t5, notes: '',
                usedParts: [],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
            {
                id: 'o-old-3', number: 'ORD-OLD-03', clientId: 'c5', vehicleId: 'v6', serviceId: 's6', serviceName: 'Колодки задние',
                employeeId: 'e1', status: 'done', total: 220, paid: 220, date: dates.t6, notes: '',
                usedParts: [{ partId: 'p3', quantity: 1 }],
                inspection: { bodyDamage: false, tireWear: 'normal', oilLevel: 'ok', coolantLevel: 'ok', brakeFluid: 'ok' }
            },
        ],

        // ==========================================
        // 7. ПЛАТЕЖИ (Соответствуют заказам выше)
        // ==========================================
        payments: [
            // Сегодня
            { id: 'pay-t0-1', orderId: 'o-t0-1', amount: 100, method: 'card', date: dates.t0 },
            { id: 'pay-t0-2', orderId: 'o-t0-2', amount: 90, method: 'cash', date: dates.t0 },

            // Вчера
            { id: 'pay-t1-1', orderId: 'o-t1-1', amount: 185, method: 'erp', date: dates.t1 },
            { id: 'pay-t1-2', orderId: 'o-t1-2', amount: 250, method: 'card', date: dates.t1 },

            // Позавчера
            { id: 'pay-t2-1', orderId: 'o-t2-1', amount: 150, method: 'cash', date: dates.t2 },
            { id: 'pay-t2-2', orderId: 'o-t2-2', amount: 185, method: 'card', date: dates.t2 },

            // 3 дня назад
            { id: 'pay-t3-1', orderId: 'o-t3-1', amount: 120, method: 'cash', date: dates.t3 },
            { id: 'pay-t3-2', orderId: 'o-t3-2', amount: 300, method: 'erp', date: dates.t3 },

            // Старые
            { id: 'pay-old-1', orderId: 'o-old-1', amount: 185, method: 'card', date: dates.t4 },
            { id: 'pay-old-2', orderId: 'o-old-2', amount: 90, method: 'cash', date: dates.t5 },
            { id: 'pay-old-3', orderId: 'o-old-3', amount: 220, method: 'card', date: dates.t6 },
        ],

        // ==========================================
        // 8. КАМЕРЫ
        // ==========================================
        cameras: [
            { id: 'cam-1', name: 'Пост 1 — Подъемник', zone: 'Ремонтная зона', status: 'online', employeeId: 'e1' },
            { id: 'cam-2', name: 'Пост 2 — Шиномонтаж', zone: 'Шиномонтаж', status: 'online', employeeId: 'e3' },
            { id: 'cam-3', name: 'Въезд / Приемка', zone: 'Приемка', status: 'offline', employeeId: null },
            { id: 'cam-4', name: 'Склад запчастей', zone: 'Склад', status: 'online', employeeId: null },
        ],

        // ==========================================
        // 9. СОБЫТИЯ ОТ AI
        // ==========================================
        videoEvents: [
            {
                id: 'evt-1', cameraId: 'cam-1', employeeId: 'e1', type: 'ppe_missing', severity: 'high',
                message: 'Нет очков', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), acknowledged: false
            },
            {
                id: 'evt-2', cameraId: 'cam-1', employeeId: 'e1', type: 'cycle_completed', severity: 'low',
                message: 'Цикл завершен', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), acknowledged: true
            },
            {
                id: 'evt-3', cameraId: 'cam-2', employeeId: 'e3', type: 'phone_use', severity: 'critical',
                message: 'Телефон в работе', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), acknowledged: false
            },
            {
                id: 'evt-4', cameraId: 'cam-1', employeeId: 'e1', type: 'idle_detected', severity: 'medium',
                message: 'Простой 10 мин', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), acknowledged: false
            },
        ],

        // ==========================================
        // 10. KPI МЕТРИКИ
        // ==========================================
        kpiMetrics: {
            e1: { score: 85, violations: 1, cycles: 12, idleMinutes: 15, safetyScore: 90 },
            e2: { score: 92, violations: 0, cycles: 8, idleMinutes: 5, safetyScore: 98 },
            e3: { score: 78, violations: 2, cycles: 15, idleMinutes: 20, safetyScore: 80 },
            e4: { score: 88, violations: 0, cycles: 5, idleMinutes: 10, safetyScore: 95 },
        },

        // ==========================================
        // 11. ЗАЯВКИ НА ЗАПИСЬ (Новый модуль)
        // ==========================================
        bookings: [
            { id: 'b1', clientName: 'Алексей Иванов', phone: '+375 29 111-22-33', serviceId: 's1', serviceName: 'Замена масла', date: dates.future1, timeSlot: '10:00', status: 'pending', createdAt: new Date().toISOString() },
            { id: 'b2', clientName: 'Мария Петрова', phone: '+375 33 444-55-66', serviceId: 's3', serviceName: 'Шиномонтаж', date: dates.future1, timeSlot: '14:30', status: 'confirmed', createdAt: new Date().toISOString() },
            { id: 'b3', clientName: 'Станислав К.', phone: '+375 25 777-88-99', serviceId: 's2', serviceName: 'Диагностика тормозов', date: dates.t0, timeSlot: '16:00', status: 'pending', createdAt: new Date().toISOString() },
        ],

        // src/data/seed.js (добавь этот массив в конец объекта return)

        // ... существующие parts, orders ...

        suppliersOffers: [
            // Для колодок TRW (легковые)
            {
                id: 'so-1', partArticle: 'TRW-GDB1624', supplierName: 'AutoDoc.by', price: 175, deliveryDays: 1, rating: 4.8, inStock: true
            },
            {
                id: 'so-2', partArticle: 'TRW-GDB1624', supplierName: 'Emparts.ru', price: 160, deliveryDays: 3, rating: 4.5, inStock: true
            },
            {
                id: 'so-3', partArticle: 'TRW-GDB1624', supplierName: 'Exist.by', price: 182, deliveryDays: 2, rating: 4.9, inStock: false // Нет в наличии
            },

            // Для антифриза
            {
                id: 'so-4', partArticle: 'FELIX-G12-5L', supplierName: 'Local Depot', price: 60, deliveryDays: 0, rating: 4.0, inStock: true
            },

            // Для колодок BMW X5 (SUV)
            {
                id: 'so-5', partArticle: 'BMW-X5-BP', supplierName: 'AutoDoc.by', price: 270, deliveryDays: 2, rating: 4.8, inStock: true
            },
            {
                id: 'so-6', partArticle: 'BMW-X5-BP', supplierName: 'OEM Direct', price: 350, deliveryDays: 1, rating: 5.0, inStock: true // Оригинал дороже
            },
        ],
        appointments: [],
        notifications: [],
        auditLogs: []
    };
};