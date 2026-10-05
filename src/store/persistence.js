import { initialState } from './initialState';

export const STORAGE_KEY = 'business-os-demo-v1';

// Функция загрузки данных из localStorage
export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null; // Нет данных — возвращаем null
        }

        const parsed = JSON.parse(raw);

        // Простая проверка версии (если структура поменялась)
        if (!parsed || parsed.version !== 1) {
            return null;
        }

        // Возвращаем данные, объединенные с дефолтной структурой
        return {
            ...initialState(),
            ...parsed,
            settings: {
                ...initialState().settings,
                ...(parsed.settings || {}),
            },
        };
    } catch (error) {
        console.warn('Failed to load state from localStorage:', error);
        return null;
    }
}

// Функция сохранения данных в localStorage
export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Failed to save state to localStorage:', error);
    }
}

// Функция очистки данных
export function clearState() {
    localStorage.removeItem(STORAGE_KEY);
}