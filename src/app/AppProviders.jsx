import { UiProvider } from '../context/UiContext';
import { DataProvider } from '../context/DataContext';

// --- ДИАГНОСТИКА (временная) ---
console.log('DEBUG: UiProvider type:', typeof UiProvider);
console.log('DEBUG: DataProvider type:', typeof DataProvider);

if (typeof UiProvider !== 'function') {
    throw new Error(
        '❌ UiProvider is UNDEFINED!\n' +
        'Проверь импорт в src/app/AppProviders.jsx:\n' +
        'Должно быть: import { UiProvider } from \'../context/UiContext\';\n' +
        'Или проверь экспорт в src/context/UiContext.jsx:\n' +
        'Должно быть: export function UiProvider({ children }) { ... }'
    );
}

if (typeof DataProvider !== 'function') {
    throw new Error(
        '❌ DataProvider is UNDEFINED!\n' +
        'Проверь импорт в src/app/AppProviders.jsx:\n' +
        'Должно быть: import { DataProvider } from \'../context/DataContext\';\n' +
        'Или проверь экспорт в src/context/DataContext.jsx:\n' +
        'Должно быть: export function DataProvider({ children }) { ... }'
    );
}
// -------------------------------

export function AppProviders({ children }) {
    return (
        <UiProvider>
            <DataProvider>{children}</DataProvider>
        </UiProvider>
    );
}

export default AppProviders;