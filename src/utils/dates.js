// src/utils/dates.js

export const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};
// src/utils/dates.js

// ... существующие экспорты ...

export const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '—';

    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} год(а) назад`;

    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} мес. назад`;

    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} дн. назад`;

    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} ч. назад`;

    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} мин. назад`;

    return 'Только что';
};

// ЭТА ФУНКЦИЯ КРИТИЧЕСКИ ВАЖНА ДЛЯ SEED.JS
export const toISODate = (date = new Date()) => {
    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseDate = (value) => {
    if (!value) return startOfToday();

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? startOfToday() : date;
};

export const formatDate = (value) => {
    if (!value) return '—';

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parseDate(value));
};

export const daysUntil = (value) => {
    if (!value) return 9999;
    return Math.round((parseDate(value) - startOfToday()) / 86400000);
};

export const addDays = (days) => {
    const date = startOfToday();
    date.setDate(date.getDate() + days);
    return toISODate(date); // Используем нашу же функцию для возврата строки YYYY-MM-DD
};

export const dueLabel = (days) => {
    if (days < 0) return `просрочено на ${Math.abs(days)} дн.`;
    if (days === 0) return 'сегодня';
    if (days === 1) return 'завтра';
    return `через ${days} дн.`;
};