import { makeSeed } from '../data/seed';

// Базовая структура состояния приложения
export const createInitialState = () => ({
    version: 1,

    // Настройки бизнеса (название, валюта, ниша)
    settings: {
        companyName: 'AutoService Demo',
        currency: 'BYN',
        niche: 'auto', // auto, beauty, barber, coffee
    },

    // Коллекции данных (пустые массивы по умолчанию)
    clients: [],
    services: [],
    orders: [],
    appointments: [],
    payments: [],
    parts: [],       // Склад / Запчасти
    employees: [],   // Сотрудники
    notifications: [], // Журнал уведомлений
    auditLogs: [],   // Логи действий

    // UI-состояние (если нужно хранить в сторе, а не в локальном состоянии компонента)
    ui: {
        activeTab: 'dashboard',
        savedFilters: {},
        recentItems: [],
        favorites: []
    }
});

// Функция, которая возвращает начальное состояние с демо-данными
// Это используется при первом запуске или сбросе демо
export const initialState = () => {
    const base = createInitialState();
    const seedData = makeSeed();

    return {
        ...base,
        ...seedData, // Разворачиваем демо-данные поверх пустых массивов
    };
};